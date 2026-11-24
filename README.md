# PCS v2

A Laravel 12 backend with a React (TypeScript) single-page frontend built by Vite.

## Running on localhost

### 1. Requirements

Install these first:

| Tool             | Version                 | Notes                                                                                                        |
| ---------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| PHP              | 8.2 or newer            | Needs the `pdo_mysql`, `mbstring`, `openssl`, `fileinfo` and `curl` extensions. XAMPP's PHP works. |
| Composer         | 2.x                     | https://getcomposer.org                                                                                      |
| Node.js          | 20 or newer, with npm   | https://nodejs.org                                                                                           |
| MySQL or MariaDB | MySQL 8 / MariaDB 10.4+ | XAMPP, Laragon, or a standalone install all work.                                                            |

> **Use MySQL/MariaDB, not SQLite.** `.env.example` defaults to `DB_CONNECTION=sqlite`, but the
> users-table migration runs MySQL-only SQL (`SHOW TABLES`, `ENGINE=InnoDB`), so `php artisan migrate`
> fails on SQLite.

### 2. Install dependencies

From the project folder:

```bash
composer install
npm install
```

### 3. Create the environment file

```bash
cp .env.example .env          # PowerShell: Copy-Item .env.example .env
php artisan key:generate
```

### 4. Configure the database

Create an empty database, for example in phpMyAdmin or the MySQL shell:

```sql
CREATE DATABASE pcs_v2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then edit `.env`. Replace the `DB_CONNECTION=sqlite` line and uncomment the others:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pcs_v2
DB_USERNAME=root
DB_PASSWORD=
```

(XAMPP's default MySQL user is `root` with an empty password.)

Set the app URL to match the port the dev server uses:

```dotenv
APP_URL=http://localhost:8000
```

### 5. Run migrations, seed data, and link storage

```bash
php artisan migrate --seed
php artisan storage:link
```

- `--seed` creates the roles, the onboarding stages, and a default admin account (see
  `database/seeders/DatabaseSeeder.php` for its email and password). Change that password after you
  first sign in.
- `storage:link` makes uploaded files (blog covers, compliance documents) reachable at `/storage/...`.

**Optional: make the seeded admin a Super Admin.** A migration promotes the seeded admin to Super Admin,
but on a fresh database it runs before the seeder creates that account, so the account starts as a
regular Admin. To get access to Super Admin pages such as the activity log, run:

```bash
php artisan tinker --execute="App\Models\User::where('email','admin@gmail.com')->update(['role_id' => App\Models\Role::where('name','Super Admin')->value('id')]);"
```

### 6. Start the app

The quickest way starts everything in one terminal:

```bash
composer run dev
```

This runs four processes together: the Laravel server, the queue worker, the log viewer (`pail`), and
the Vite dev server.

If `pail` will not start (it needs the `pcntl` extension, which Windows PHP does not have), run the
processes yourself in separate terminals instead:

```bash
php artisan serve
```

```bash
npm run dev
```

```bash
php artisan queue:listen --tries=1
```

Open **http://localhost:8000** in your browser. Keep `npm run dev` running: it serves the React code with
hot reload. Don't open the Vite URL (port 5173) directly.

To run without the Vite dev server, build the frontend once with `npm run build`, then only
`php artisan serve` is needed.

## Optional integrations

The app runs without these, but the matching features need keys in `.env`.

**Email (OTP codes, contact form, notifications).** With the default `MAIL_MAILER=log`, emails are
not sent. They are written to `storage/logs/laravel.log`, so you can copy OTP codes from there while
developing. To send real email, set `MAIL_MAILER=smtp` and fill in the `MAIL_*` values.

**Stripe payments.** Use test-mode keys from the Stripe dashboard:

```dotenv
STRIPE_SECRET=sk_test_...
STRIPE_KEY=pk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

Restart `npm run dev` after changing any `VITE_` variable.

**Google sign-in.** Create an OAuth client in Google Cloud Console with the redirect URI
`http://localhost:8000/auth/google/callback`, then set:

```dotenv
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

## Common problems

| Symptom                                                                      | Fix                                                                  |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `could not find driver` during migrate                                     | Enable `extension=pdo_mysql` in your `php.ini`.                  |
| `SQLSTATE[HY000] [2002]` / connection refused                              | MySQL isn't running. Start it (e.g. from the XAMPP control panel).   |
| Migration error mentioning `SHOW TABLES` or a syntax error near `ENGINE` | `DB_CONNECTION` is still `sqlite`. Switch to `mysql` (step 4). |
| Blank page or `Vite manifest not found`                                    | `npm run dev` isn't running. Start it, or run `npm run build`.   |
| Uploaded images return 404                                                   | Run `php artisan storage:link`.                                    |
| Config changes have no effect                                                | Run `php artisan config:clear`.                                    |
| Need a clean database                                                        | `php artisan migrate:fresh --seed` (this deletes all data).        |
