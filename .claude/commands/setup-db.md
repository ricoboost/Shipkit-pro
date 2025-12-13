# Configure Database

Set up your database connection and run migrations.

## Instructions

Run the database setup script:

```bash
npx tsx scripts/setup/setup-db.ts
```

## Supported Databases

1. **PostgreSQL** - Standard PostgreSQL (local or cloud)
2. **MySQL** - MySQL database (local or cloud)
3. **SQLite** - File-based database (great for development)
4. **Supabase** - PostgreSQL with Supabase (includes auth & realtime)
5. **Neon** - Serverless PostgreSQL with branching
6. **PlanetScale** - Serverless MySQL with branching

## Command Line Options

Select provider directly:
```bash
npx tsx scripts/setup/setup-db.ts --provider postgresql
npx tsx scripts/setup/setup-db.ts --provider supabase
npx tsx scripts/setup/setup-db.ts --provider sqlite
```

Skip migrations:
```bash
npx tsx scripts/setup/setup-db.ts --skip-migrate
```

## What This Script Does

1. Helps you choose a database provider
2. Updates `DATABASE_URL` in your `.env` file
3. Updates Prisma schema provider if needed
4. Tests the database connection
5. Runs `prisma generate` and `prisma db push`

## Manual Setup

If you prefer manual setup:

1. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/shipkit"
   ```

2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

3. Push schema to database:
   ```bash
   npx prisma db push
   ```

4. Verify with Prisma Studio:
   ```bash
   npx prisma studio
   ```
