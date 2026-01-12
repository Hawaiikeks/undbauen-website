# Database Setup

## PostgreSQL Installation

### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the postgres user password you set during installation

### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Database Creation

1. Connect to PostgreSQL:
```bash
psql -U postgres
```

2. Create database:
```sql
CREATE DATABASE undbauen;
```

3. Create user (optional, or use postgres):
```sql
CREATE USER undbauen_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE undbauen TO undbauen_user;
```

4. Connect to the database:
```bash
psql -U postgres -d undbauen
```

5. Run the schema:
```bash
psql -U postgres -d undbauen -f schema.sql
```

## Environment Variables

Copy `.env.example` to `.env` and update with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=undbauen
DB_USER=postgres
DB_PASSWORD=your_password_here
```

## Migration

After setting up the database, run migrations:

```bash
npm run migrate
```

## Seed Data (Optional)

To populate with test data:

```bash
npm run seed
```






