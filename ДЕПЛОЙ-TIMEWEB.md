# Деплой на Timeweb (тестовый сервер)

Два пути: **Timeweb Cloud Apps** (репозиторий → сборка) и **Docker/VPS**.
Полный набор переменных — в `deploy/.env.production.example`.

## Нужно заранее

- **PostgreSQL** (Timeweb DB или локальный) — из панели берите строку подключения.
- **Домен** — «тестовая ссылка» вида `https://xxx.twc1.net`.

## Вариант A. Timeweb Cloud Apps (Node)

1. Новое приложение → тип **Node.js**, подключить репозиторий `ZuevPU/MashukOnline`
   (ветка `main`).
2. **Команда сборки:**
   ```
   pnpm install --frozen-lockfile && pnpm build
   ```
3. **Команда запуска:**
   ```
   pnpm start
   ```
   Приложение слушает порт из переменной `PORT` (её задаёт Timeweb).
4. **Путь проверки состояния:** `/api/health`.
5. **Переменные окружения** (панель → Переменные):
   ```
   DATABASE_URL=postgres://…       (строка подключения к Postgres)
   AUTH_SECRET=<openssl rand -base64 32>
   PUBLIC_URL=https://xxx.twc1.net
   ALLOW_INSECURE_COOKIES=1        (только если тест по http; на https не нужно)
   ```
   Для входа через LMS дополнительно:
   ```
   LMS_OAUTH_AUTHORIZE_URL=https://lms.mashuk.online/oauth/authorize
   LMS_OAUTH_TOKEN_URL=https://lms.mashuk.online/oauth/token
   LMS_OAUTH_USERINFO_URL=https://lms.mashuk.online/oauth/userinfo
   LMS_OAUTH_CLIENT_ID=<API публичный ключ из панели LMS>
   LMS_OAUTH_CLIENT_SECRET=<API секретный ключ из панели LMS>
   LMS_OAUTH_SCOPE="openid email profile"
   LMS_OAUTH_REDIRECT_URI=https://xxx.twc1.net/api/auth/sso/lms/callback
   ```
6. **Миграции** (один раз, из консоли приложения):
   ```
   pnpm db:migrate
   ```
   Создать администратора: `pnpm admin:create -- admin@czmashuk.ru "Имя"`.

> Если в окружении сборки нет pnpm — используйте npm:
> `npm install && npm run build`, запуск `npm run start`.

## Вариант B. Docker на VPS

Как в `ДЕПЛОЙ.md`: `docker compose --env-file .env up -d`, миграции профилем
`tools`. Домен и TLS — Caddy.

## Проверка после деплоя

- `https://xxx.twc1.net/api/health` → `{"ok":true,"db":true}`.
- `https://xxx.twc1.net/` → главная; `/apply`, `/events/seminar`, `/events/media`.
- Админка: `/admin` (войти администратором), `/admin/applications`.

## Вход через LMS на тесте

LMS принимает только **HTTPS**-редиректы. Ваша тестовая ссылка `https://xxx.twc1.net`
подходит. Добавьте в LMS в приложении redirect URI:
```
https://xxx.twc1.net/api/auth/sso/lms/callback
```
и задайте `LMS_OAUTH_REDIRECT_URI` тем же значением. После этого в шапке
появится кнопка «Войти через LMS».

## Файлы (важно для прода)

Загруженные файлы лежат в `./storage` (или S3, если задан `S3_*`). На
Timeweb Apps файловая система между деплоями может не сохраняться — для
рабочего контура подключите **S3-совместимое хранилище** или том.

## Обновление на VPS

Образы собираются в GitHub Actions и публикуются в `ghcr.io/zuevpu/mashukonline`.
На сервере обновление — пуллом готового образа (без сборки на сервере):

```bash
cd /opt/mashuk
git pull
docker compose --env-file .env pull app
docker compose --env-file .env up -d
docker compose --env-file .env restart caddy   # если менялся Caddyfile
```

## Резервные копии (cron)

```cron
30 3 * * * cd /opt/mashuk && ./deploy/backup.sh >> /var/log/mashuk-backup.log 2>&1
```

Дампы базы и архивы файлов кладутся в `/var/backups/mashuk` и хранятся 7 дней.
