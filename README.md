# MashukOnline

Цифровой портал АНО «Центр знаний «Машук» на домене `mashuk.online`: витрина
программ, лендинги мероприятий, формы заявок и платформа сопровождения
слушателей в одном приложении.

## Возможности

- **Витрина онлайн-курсов** — карточки с описанием и обложками, переход на
  регистрацию в LMS (`lms.mashuk.online`).
- **Лендинги мероприятий** — семинар «Образование на высоте», медиамероприятие,
  итоги программы.
- **Формы заявок** — семинар (`/apply`), данные участников (`/info`),
  муниципалитеты (`/muni`), медиа (`/events/media/apply`). Загрузка файлов,
  PDF-согласия, серверная валидация.
- **Платформа сопровождения** — личный кабинет, рабочее пространство программы:
  канал с постами и комментариями, чаты, расписание, материалы, участники.
- **Живые опросы и квизы** — облако слов, варианты, шкала, ранжирование, Q&A,
  колесо, квиз, режим презентации с QR-кодом.
- **Единая админка** — программы, заявки (три формы + медиа), опросы, состав;
  выгрузка Excel и ZIP согласий.
- **Единый вход с LMS** по OAuth 2.0.
- **Политика конфиденциальности** и согласие на cookie.

## Стек

- Next.js 16 (App Router), React 19, TypeScript, Tailwind 4
- PostgreSQL, Drizzle ORM
- Реалтайм — Server-Sent Events, редактор — TipTap
- Docker Compose (приложение + PostgreSQL + Caddy с HTTPS)
- Сборка образов — GitHub Actions (`ghcr.io`), обновление сервера автоматическое

## Структура

```
src/              приложение Next.js (app, components, lib)
drizzle/          схема и миграции базы
public/brand      брендинг для рантайма (логотипы, иконки, маскот, шрифты)
assets/brand-src  исходники брендинга (AI/PNG/SVG, шрифты)
docs/brand        руководство по фирменному стилю
deploy/           Caddy, Postgres, бэкапы, CI-конфиги
scripts/          сидинг, администратор, миграция данных
```

## Локальный запуск

```bash
npm install
cp .env.example .env.local      # укажите DATABASE_URL
npm run db:migrate
npm run dev                     # http://localhost:4321
```

Без базы витрина работает на демонстрационных данных, формы и админка требуют
PostgreSQL.

## Деплой

```bash
cp deploy/.env.production.example .env   # заполните DOMAIN, пароли, секреты
docker compose --env-file .env up -d --build
docker compose --env-file .env --profile tools run --rm tools pnpm db:migrate
docker compose --env-file .env --profile tools run --rm tools pnpm admin:create -- admin@czmashuk.ru "Имя"
```

Обновление на сервере — пуллом готового образа:

```bash
cd /opt/mashuk && git pull
docker compose --env-file .env pull app
docker compose --env-file .env up -d
```

Доступно автообновление (cron): `deploy/autoupdate.sh` подтягивает образ и
конфигурацию из `main`, применяет миграции и перезапускает Caddy при изменении
`Caddyfile`.

## Бэкапы

```bash
deploy/backup.sh    # база + загруженные файлы в /var/backups/mashuk
```

```cron
30 3 * * * cd /opt/mashuk && ./deploy/backup.sh >> /var/log/mashuk-backup.log 2>&1
```

## Безопасность

- HTTPS/HSTS, CSP и заголовки безопасности, сессии в `httpOnly`-cookie.
- Файлы заявок (портфолио, согласия, сканы) доступны только администратору.
- Ограничение частоты отправок и защита форм от спама.
- Сервер и база данных размещены в РФ; аналитика подключается только после
  согласия пользователя.

## Контакты

Техническая поддержка: online@czmashuk.ru
