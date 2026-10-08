# Serverga qo'yish — 212.47.58.42

```
brauzer ──80──> nginx ──┬──> /var/www/famous-books  (statik fayllar)
                        └──> 127.0.0.1:8080         (/api/*)
```

Frontend va API bitta origindan berilgani uchun CORS kerak emas, barcha
so'rovlar nisbiy `/api/...` manziliga ketadi.

## Serverda allaqachon ishlayotgani (tekshirilgan)

| Narsa | Holat |
|---|---|
| nginx 80-portda statik fayllarni beradi | ✅ |
| `/my-posts` kabi manzillar index.html ga tushadi (SPA) | ✅ |
| `/api/*` backendga uzatilyapti | ✅ |
| OAuth2 `redirect_uri` tashqi manzilga chiqyapti | ✅ `http://212.47.58.42/api/login/oauth2/code/google` |
| Rasmlarni tokensiz olish | ✅ |

`deploy/nginx.conf` — shu sozlamaning namunasi (zaxira yoki qayta tiklash uchun).

## 1. Frontendni yangilash — hozir shart

Serverdagi bundle **eski**: ichida `http://localhost:8080/api` qotirilgan,
ya'ni har bir tashrifchining brauzeri o'z kompyuteriga murojaat qiladi.
Yangi versiyada manzil nisbiy (`/api`), shuning uchun qayta yig'ib qo'yish kerak:

```bash
npm ci
npm run build
rsync -av --delete dist/ root@212.47.58.42:/var/www/famous-books/
```

Hech qanday `.env` kerak emas.

## 2. Backendda qolgan ishlar

### 2.1 OAuth2 dan keyin localhost ga yuboryapti — Google kirish ishlamaydi

`Oauth2SuccessHandler:71` da manzil qotirilgan:

```java
response.sendRedirect("http://localhost:5173/oauth2-success?...");
```

Google autentifikatsiyasi muvaffaqiyatli tugagach foydalanuvchi o'z
kompyuteridagi 5173-portga yuboriladi. Sozlamadan olish kerak:

```java
@Value("${app.frontend-url}")
private String frontendUrl;
...
response.sendRedirect(frontendUrl + "/oauth2-success?accessToken=" + accessToken
        + "&refreshToken=" + refreshToken);
```

```yaml
app:
  frontend-url: ${FRONTEND_URL:http://localhost:5173}
```

Serverda `FRONTEND_URL=http://212.47.58.42`.

Google Console'ga **Authorized redirect URI** qo'shilgan bo'lishi kerak:
`http://212.47.58.42/api/login/oauth2/code/google`
(lokal uchun eskisini o'chirmang).

### 2.2 1 MB dan katta rasm yuklanmaydi

Tekshirildi: 469 KB → 200, **1.4 MB → bo'sh 401**. Telefonda olingan rasm
sig'maydi. Spring'ning standart chegarasi 1 MB:

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 15MB
      max-request-size: 20MB
```

Nginx tomonida `client_max_body_size 20m` allaqachon konfigda bor.

Qo'shimcha: `MaxUploadSizeExceededException` `GlobalExceptionHandler` dan
o'tib ketyapti — shuning uchun foydalanuvchi sababini bilmaydi. Uni ushlab,
tushunarli xabar qaytarsa yaxshi bo'lardi.

### 2.3 Yuklangan fayllar nisbiy papkada

`file.base-path: uploads/` — backend qaysi papkadan ishga tushirilganiga
bog'liq. Deploy paytida eski rasmlar yo'qolib qolishi mumkin:

```yaml
file:
  base-path: ${UPLOADS_DIR:uploads/}
```

Serverda `UPLOADS_DIR=/var/lib/famous-books/uploads/` va o'sha papka
backend foydalanuvchisiga tegishli bo'lsin.

### 2.4 Maxfiy ma'lumotlar `application.yaml` ichida

JWT kalitlari, Google client secret va gmail paroli ochiq yozilgan — repoga
tushgan bo'lsa almashtirish kerak. Muhit o'zgaruvchilariga ko'chiring:

```yaml
jwt:
  access-token:  { secret-key: ${JWT_ACCESS_SECRET} }
  refresh-token: { secret-key: ${JWT_REFRESH_SECRET} }
spring:
  datasource: { username: ${DB_USER}, password: ${DB_PASSWORD} }
  mail:       { password: ${MAIL_PASSWORD} }
  security:
    oauth2:
      client:
        registration:
          google: { client-secret: ${GOOGLE_CLIENT_SECRET} }
```

### 2.5 8080-port tashqariga ochiq

`http://212.47.58.42:8080/api/...` to'g'ridan-to'g'ri ochilyapti. Nginx
orqali ishlagani uchun uni faqat localhostga qoldirish xavfsizroq:

```yaml
server:
  address: 127.0.0.1
```

yoki `ufw deny 8080`.

## 3. Tekshirish

```bash
curl -I http://212.47.58.42/my-posts                       # 200 (404 emas)
curl -s http://212.47.58.42/api/v3/api-docs | head -c 60   # JSON
curl -s http://212.47.58.42/assets/index-*.js | grep -c localhost:8080   # 0 bo'lsin
```

Brauzerda: kirish → post qo'shish (rasm bilan) → izoh yozish → F5 bosish →
Google orqali kirish.
