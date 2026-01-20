# Подробная инструкция по установке M-etod Finance Hub на Debian 13

## Требования к серверу

- **ОС**: Debian 13 (Trixie)
- **RAM**: минимум 1 GB
- **CPU**: 1 core (рекомендуется 2+)
- **Диск**: минимум 5 GB свободного места
- **Доступ**: root или пользователь с sudo

---

## Шаг 1: Подготовка сервера

### 1.1. Подключитесь к серверу

```bash
ssh root@ваш-ip-адрес
```

### 1.2. Обновите систему

```bash
apt update && apt upgrade -y
```

### 1.3. Установите необходимые пакеты

```bash
apt install -y curl git nginx ufw software-properties-common
```

---

## Шаг 2: Установка Node.js и Bun

### 2.1. Установите Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

Проверка:
```bash
node --version  # Должно показать v20.x.x
npm --version   # Должно показать 10.x.x
```

### 2.2. Установите Bun (рекомендуемый пакетный менеджер)

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

Проверка:
```bash
bun --version  # Должно показать 1.x.x
```

---

## Шаг 3: Клонирование проекта из GitHub

### 3.1. Создайте директорию для сайта

```bash
mkdir -p /var/www
cd /var/www
```

### 3.2. Клонируйте репозиторий

```bash
git clone https://github.com/kazik005/m-etod-finance-hub.git
cd m-etod-finance-hub
```

---

## Шаг 4: Настройка переменных окружения

### 4.1. Создайте файл `.env.local`

```bash
nano .env.local
```

Добавьте следующее содержимое:

```env
# Blink SDK конфигурация
VITE_BLINK_PROJECT_ID=metod-finance-hub-vb5rh5y0
VITE_BLINK_PUBLISHABLE_KEY=blnk_pk_YBYvM7bNi_9CJELLDOGcFHXWK5HIAvm_
```

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## Шаг 5: Установка зависимостей и сборка

### 5.1. Установите зависимости проекта

```bash
bun install
```

Или если используете npm:
```bash
npm install
```

### 5.2. Соберите проект для продакшена

```bash
bun run build
```

Или:
```bash
npm run build
```

После успешной сборки появится папка `dist/` с готовым сайтом.

---

## Шаг 6: Настройка Nginx

### 6.1. Создайте конфигурацию сайта

```bash
nano /etc/nginx/sites-available/m-etod
```

Вставьте следующую конфигурацию:

```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name ваш-домен.ru www.ваш-домен.ru;
    
    root /var/www/m-etod-finance-hub/dist;
    index index.html;
    
    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/x-javascript application/xml application/json;
    
    # Кеширование статики
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA маршрутизация - все пути отдают index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### 6.2. Активируйте сайт

```bash
ln -s /etc/nginx/sites-available/m-etod /etc/nginx/sites-enabled/
```

### 6.3. Удалите стандартный сайт (опционально)

```bash
rm -f /etc/nginx/sites-enabled/default
```

### 6.4. Проверьте конфигурацию

```bash
nginx -t
```

Если все OK, вывод будет:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 6.5. Перезапустите Nginx

```bash
systemctl restart nginx
systemctl enable nginx
```

---

## Шаг 7: Настройка Firewall

```bash
ufw allow 'Nginx Full'
ufw allow ssh
ufw enable
```

Проверка статуса:
```bash
ufw status
```

---

## Шаг 8: Установка SSL (Let's Encrypt)

### 8.1. Установите Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### 8.2. Получите SSL сертификат

```bash
certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
```

Следуйте инструкциям на экране.

### 8.3. Настройте автообновление

```bash
certbot renew --dry-run
```

---

## Шаг 9: Привязка базы данных (Blink SDK)

**Важно**: M-etod Finance Hub использует **Blink SDK** для работы с базой данных. 

### Как это работает:

1. **База данных размещена в облаке Blink** и автоматически подключена через SDK
2. **Все данные сохраняются автоматически** при использовании `blink.db.*` методов
3. **Никакой локальной базы не требуется** - проект работает через Blink API

### Структура базы данных:

| Таблица | Описание |
|---------|----------|
| `articles` | Статьи |
| `news` | Новости |
| `categories` | Категории |
| `offers` | Офферы |
| `forum_topics` | Темы форума |
| `forum_posts` | Сообщения форума |
| `currency_rates` | Курсы валют |
| `profiles` | Профили пользователей |
| `newsletter_subscriptions` | Подписки |
| `site_settings` | Настройки сайта |

### Создание необходимых таблиц:

Таблицы создаются автоматически при первом запуске через Blink Platform. 
Если нужно создать вручную, используйте панель Blink: https://blink.new

---

## Шаг 10: Первоначальная настройка

### 10.1. Откройте сайт в браузере

```
http://ваш-домен.ru (или https:// если настроили SSL)
```

### 10.2. Войдите в админ-панель

1. Зарегистрируйтесь или войдите
2. Для доступа к админке, ваш email должен быть: `admin@m-etod.ru`
3. Или измените файл `src/contexts/AuthContext.tsx`:
   ```tsx
   const ADMIN_EMAILS = ['ваш@email.ru'];
   ```
4. Пересоберите и разверните проект заново

### 10.3. Заполните демо-данные

1. Перейдите в **Админ → Обзор**
2. Нажмите **"Заполнить демо-данными"**

---

## Шаг 11: Обновление сайта

Когда нужно обновить сайт из GitHub:

```bash
cd /var/www/m-etod-finance-hub

# Получить изменения
git pull origin main

# Переустановить зависимости (если были изменения)
bun install

# Пересобрать
bun run build

# Перезапустить nginx (опционально)
systemctl reload nginx
```

---

## Полезные команды

### Логи Nginx
```bash
# Логи ошибок
tail -f /var/log/nginx/error.log

# Логи доступа
tail -f /var/log/nginx/access.log
```

### Статус сервисов
```bash
systemctl status nginx
systemctl status ufw
```

### Перезапуск
```bash
systemctl restart nginx
```

---

## Troubleshooting (Решение проблем)

### Ошибка "502 Bad Gateway"
- Убедитесь, что файлы находятся в `/var/www/m-etod-finance-hub/dist`
- Проверьте права: `chmod -R 755 /var/www/m-etod-finance-hub`

### Белая страница
- Проверьте, что SPA routing настроен (`try_files $uri $uri/ /index.html`)
- Откройте DevTools (F12) и посмотрите ошибки в консоли

### Ошибки Blink SDK
- Убедитесь, что `.env.local` содержит правильные ключи
- Проверьте сетевые запросы в DevTools → Network

---

## Контакты поддержки

- **GitHub**: https://github.com/kazik005/m-etod-finance-hub
- **Blink Platform**: https://blink.new
- **Email**: support@m-etod.ru

---

*Инструкция создана: Январь 2026*
