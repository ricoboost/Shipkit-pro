# Create Admin User

Create the first admin user for your ShipKit application.

## Instructions

Run the admin creation script:

```bash
npx tsx scripts/setup/create-admin.ts
```

## Command Line Options

Create with arguments (non-interactive):

```bash
npx tsx scripts/setup/create-admin.ts \
  --email admin@example.com \
  --password YourSecurePassword123 \
  --name "Admin User"
```

## Interactive Mode

If you don't provide arguments, the script will prompt you for:

1. Admin email address
2. Admin name (optional)
3. Admin password (minimum 8 characters)

## What This Script Does

1. Validates email and password
2. Checks if user already exists
3. If user exists but isn't admin, upgrades them to admin role
4. If user doesn't exist, creates new admin user
5. Hashes password securely with bcrypt

## Prerequisites

Before running this script:

1. Configure your database: `npx tsx scripts/setup/setup-db.ts`
2. Run Prisma migrations: `npx prisma db push`

## Example Usage

```bash
# Interactive mode
npx tsx scripts/setup/create-admin.ts

# With all arguments
npx tsx scripts/setup/create-admin.ts \
  --email admin@mycompany.com \
  --password SuperSecure123! \
  --name "John Admin"

# Quick create (will prompt for missing)
npx tsx scripts/setup/create-admin.ts --email admin@mycompany.com
```

## After Creation

1. Start the app: `npm run dev`
2. Go to `/auth/signin`
3. Sign in with your admin credentials
4. Access admin panel at `/admin`
