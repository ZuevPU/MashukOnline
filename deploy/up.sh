#!/usr/bin/env bash
# Запуск портала «Машук» на сервере одной командой.
#
#   1) скопируйте .env:  cp deploy/.env.production.example .env
#   2) заполните .env (DOMAIN, ACME_EMAIL, POSTGRES_PASSWORD, AUTH_SECRET, PUBLIC_URL, LMS_OAUTH_*)
#   3) запустите:        bash deploy/up.sh
#
# Скрипт собирает образ, поднимает стек и применяет миграции базы.

set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  cp deploy/.env.production.example .env
  echo "Создан .env из шаблона. Заполните его (DOMAIN, ACME_EMAIL, POSTGRES_PASSWORD, AUTH_SECRET, PUBLIC_URL) и запустите снова."
  exit 1
fi

echo "→ Сборка и запуск контейнеров…"
docker compose --env-file .env up -d --build

echo "→ Миграции базы данных…"
docker compose --env-file .env --profile tools run --rm tools pnpm db:migrate

DOMAIN="$(grep -E '^DOMAIN=' .env | cut -d= -f2- | tr -d '[:space:]')"
echo
echo "Готово. Проверка: https://${DOMAIN}/api/health"
echo "Создать администратора:"
echo "  docker compose --env-file .env --profile tools run --rm tools pnpm admin:create -- admin@czmashuk.ru \"Имя\""
