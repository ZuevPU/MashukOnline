#!/usr/bin/env python3
"""Экспортёр метрик Caddy для Prometheus.

Caddy пишет access-лог в том `mashuk_caddy_data` (`/data/access.log`) — JSON
по строке на запрос. Здесь лог читается инкрементально (переживает ротацию),
а наружу отдаются счётчики по классам ответов: 2xx/3xx/4xx/5xx.

Контейнер монтирует том Caddy только на чтение: приложение и TLS он не
задевает, на диск ничего не пишет.

Метрики:
    caddy_requests_total{class="2xx"}   — всего с момента старта
    caddy_requests_60s{class="5xx"}     — за последнюю минуту (окно WINDOW_SECONDS)
    caddy_log_bytes_total               — прочитано из лога, для диагностики
"""

from __future__ import annotations

import json
import os
import threading
import time
from collections import defaultdict, deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

LOG_PATH = Path(os.environ.get("CADDY_LOG", "/caddy/access.log"))
PORT = int(os.environ.get("PORT", "9180"))
WINDOW_SECONDS = int(os.environ.get("WINDOW_SECONDS", "60"))

lock = threading.Lock()
totals: dict[str, int] = defaultdict(int)
window: deque[tuple[float, str]] = deque()
log_bytes = 0


def classify(status: int) -> str:
    return f"{status // 100}xx"


def record(ts: float, cls: str) -> None:
    with lock:
        totals[cls] += 1
        window.append((ts, cls))


def follow() -> None:
    """Читает лог с конца; новые строки — в счётчики."""
    global log_bytes
    offset = 0
    inode: int | None = None
    started = False
    while True:
        try:
            stat = LOG_PATH.stat()
        except OSError:
            time.sleep(2)
            continue

        if not started or inode != stat.st_ino or stat.st_size < offset:
            # Первый запуск или ротация: начинаем с текущего конца файла,
            # чтобы не поднимать исторические запросы как «только что».
            offset = 0 if started else stat.st_size
            inode = stat.st_ino
            started = True

        if stat.st_size == offset:
            time.sleep(1)
            continue

        try:
            with LOG_PATH.open("rb") as handle:
                handle.seek(offset)
                chunk = handle.read()
        except OSError:
            time.sleep(1)
            continue

        offset += len(chunk)
        with lock:
            log_bytes += len(chunk)

        for line in chunk.decode("utf-8", "replace").splitlines():
            line = line.strip()
            if not line.startswith("{"):
                continue
            try:
                entry = json.loads(line)
            except ValueError:
                continue
            status, ts = entry.get("status"), entry.get("ts")
            if isinstance(status, int) and isinstance(ts, (int, float)):
                record(float(ts), classify(status))


def render() -> bytes:
    now = time.time()
    with lock:
        while window and window[0][0] < now - WINDOW_SECONDS:
            window.popleft()
        recent: dict[str, int] = defaultdict(int)
        for _, cls in window:
            recent[cls] += 1
        lines = [
            "# HELP caddy_requests_total Ответы Caddy по классам с момента старта.",
            "# TYPE caddy_requests_total counter",
        ]
        for cls in sorted(totals):
            lines.append(f'caddy_requests_total{{class="{cls}"}} {totals[cls]}')
        lines += [
            f"# HELP caddy_requests_{WINDOW_SECONDS}s Ответы Caddy за последние {WINDOW_SECONDS} с.",
            f"# TYPE caddy_requests_{WINDOW_SECONDS}s gauge",
        ]
        for cls in sorted(recent):
            lines.append(f'caddy_requests_{WINDOW_SECONDS}s{{class="{cls}"}} {recent[cls]}')
        lines += [
            "# HELP caddy_log_bytes_total Прочитано байт access-лога.",
            "# TYPE caddy_log_bytes_total counter",
            f"caddy_log_bytes_total {log_bytes}",
        ]
    return ("\n".join(lines) + "\n").encode()


class Handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802 — имя задано базовым классом
        if self.path.startswith("/metrics"):
            body, status = render(), 200
            content_type = "text/plain; version=0.0.4; charset=utf-8"
        elif self.path.startswith("/health"):
            body, status = b"ok\n", 200
            content_type = "text/plain; charset=utf-8"
        else:
            body, status = b"not found\n", 404
            content_type = "text/plain; charset=utf-8"
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *_args) -> None:  # noqa: D401 — тишина в логах
        return


def main() -> None:
    threading.Thread(target=follow, daemon=True).start()
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"caddy-exporter: {LOG_PATH} -> :{PORT}/metrics", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
