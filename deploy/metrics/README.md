# Наблюдаемость: Prometheus + Grafana

Стек живёт в основном `docker-compose.yml` за профилем `metrics` и включается
одной командой:

```bash
docker compose --profile metrics up -d
```

Наружу не публикуется ничего, кроме Grafana: Caddy проксирует `/grafana/`.
Prometheus доступен только внутри docker-сети.

## Что собирается

| Job | Источник | Метрики |
|---|---|---|
| `node` | node-exporter | CPU, память, диск, сеть, файловые системы |
| `postgres` | postgres-exporter | соединения, размер базы, транзакции |
| `caddy` | caddy-exporter | ответы по классам 2xx/3xx/4xx/5xx из access-лога |
| `blackbox` | blackbox-exporter | доступность `https://mashuk.online/api/health` |
| `prometheus` | сам Prometheus | здоровье скрейпа |

`caddy-exporter` — свой скрипт ([caddy_exporter.py](caddy_exporter.py)): Caddy в
штатной сборке не отдаёт метрики, поэтому access-лог (`/data/access.log`, JSON
по строке на запрос) читается инкрементально и превращается в счётчики.
Контейнер монтирует том Caddy **только на чтение**.

## Grafana

- Источник данных и дашборды провижнятся из репозитория
  ([deploy/grafana](../grafana)), а не создаются руками в интерфейсе —
  правки едут через git.
- Дашборд **«Машук: портал»** (`uid: mashuk-portal`, папка «Машук»): доступность,
  запросы по классам, 5xx, CPU, память, диск, соединения PostgreSQL, время
  ответа health, сеть.
- Адрес: `https://<DOMAIN>/grafana/`, логин `admin`, пароль —
  `GF_SECURITY_ADMIN_PASSWORD` из `.env`.
- Ретенция метрик — 15 дней (`prom_data`).

## Чек-лист после изменений

```bash
docker compose --profile metrics ps
docker compose exec -T prometheus wget -qO- 'http://localhost:9090/api/v1/targets?state=active'
```

Все пять job'ов должны быть в состоянии `up`. Если Prometheus не подхватил
конфиг — конфиг смонтирован файлом, поэтому нужен пересоздание контейнера,
а не `SIGHUP`:

```bash
docker compose --profile metrics up -d --force-recreate prometheus
```

## Алерты

Правила и каналы уведомлений пока не заданы: метрики только копятся.
Когда появится канал (Telegram-бот или SMTP), алерты добавляются в
Grafana → Alerting → Alert rules:

| Правило | Запрос |
|---|---|
| Диск > 80 % | `100 - node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} * 100` |
| 5xx за 5 мин | `sum(increase(caddy_requests_total{class="5xx"}[5m])) > 0` |
| Сайт недоступен | `probe_success{job="blackbox"} == 0` |
| Метрики пропали | `up == 0` |
