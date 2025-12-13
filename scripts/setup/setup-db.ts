#!/usr/bin/env tsx
/**
 * Database Setup Script
 *
 * Configures and initializes your database for ShipKit.
 *
 * Usage: npx tsx scripts/setup/setup-db.ts
 * With args: npx tsx scripts/setup/setup-db.ts --provider postgresql
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { execSync, exec } from 'child_process';

type DbProvider = 'postgresql' | 'mysql' | 'sqlite' | 'supabase' | 'neon' | 'planetscale';

interface DbConfig {
  name: string;
  description: string;
  urlTemplate: string;
  prismaProvider: string;
  setupInstructions: string[];
}

const dbProviders: Record<DbProvider, DbConfig> = {
  postgresql: {
    name: 'PostgreSQL',
    description: 'Standard PostgreSQL database (local or cloud)',
    urlTemplate: 'postgresql://USER:PASSWORD@HOST:5432/DATABASE',
    prismaProvider: 'postgresql',
    setupInstructions: [
      '1. Install PostgreSQL locally or use a cloud provider',
      '2. Create a database: createdb shipkit',
      '3. Update DATABASE_URL in .env',
      '4. Run: npx prisma db push',
    ],
  },
  mysql: {
    name: 'MySQL',
    description: 'MySQL database (local or cloud)',
    urlTemplate: 'mysql://USER:PASSWORD@HOST:3306/DATABASE',
    prismaProvider: 'mysql',
    setupInstructions: [
      '1. Install MySQL locally or use a cloud provider',
      '2. Create a database: CREATE DATABASE shipkit;',
      '3. Update DATABASE_URL in .env',
      '4. Run: npx prisma db push',
    ],
  },
  sqlite: {
    name: 'SQLite',
    description: 'File-based database, great for development',
    urlTemplate: 'file:./dev.db',
    prismaProvider: 'sqlite',
    setupInstructions: [
      '1. No installation needed!',
      '2. Update DATABASE_URL to file:./dev.db',
      '3. Run: npx prisma db push',
      '4. Note: Not recommended for production',
    ],
  },
  supabase: {
    name: 'Supabase',
    description: 'PostgreSQL with Supabase (includes auth & realtime)',
    urlTemplate: 'postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres',
    prismaProvider: 'postgresql',
    setupInstructions: [
      '1. Create project at https://supabase.com',
      '2. Go to Settings > Database',
      '3. Copy the connection string (Transaction pooler)',
      '4. Run: npx prisma db push',
    ],
  },
  neon: {
    name: 'Neon',
    description: 'Serverless PostgreSQL with branching',
    urlTemplate: 'postgresql://[USER]:[PASSWORD]@[HOST].neon.tech/[DATABASE]?sslmode=require',
    prismaProvider: 'postgresql',
    setupInstructions: [
      '1. Create project at https://neon.tech',
      '2. Copy the connection string from dashboard',
      '3. Update DATABASE_URL in .env',
      '4. Run: npx prisma db push',
    ],
  },
  planetscale: {
    name: 'PlanetScale',
    description: 'Serverless MySQL with branching',
    urlTemplate: 'mysql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?ssl={"rejectUnauthorized":true}',
    prismaProvider: 'mysql',
    setupInstructions: [
      '1. Create database at https://planetscale.com',
      '2. Get connection string from Branches > Connect',
      '3. Update DATABASE_URL in .env',
      '4. Note: Use relationMode = "prisma" in schema',
    ],
  },
};

async function main() {
  console.log('\n=Ä  ShipKit Database Setup\n');
  console.log('Configure your database connection.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  // Parse command line arguments
  const args = process.argv.slice(2);
  let selectedProvider: DbProvider | undefined;
  let skipMigration = args.includes('--skip-migrate');

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--provider' && args[i + 1]) {
      const provider = args[i + 1] as DbProvider;
      if (dbProviders[provider]) {
        selectedProvider = provider;
      }
      i++;
    }
  }

  // Interactive selection if not provided
  if (!selectedProvider) {
    console.log('Available database providers:\n');

    const providerList = Object.entries(dbProviders);
    providerList.forEach(([key, config], index) => {
      console.log(`  ${index + 1}. ${config.name}`);
      console.log(`     ${config.description}\n`);
    });

    const choice = await question('Select provider (1-6): ');
    const index = parseInt(choice) - 1;

    if (index >= 0 && index < providerList.length) {
      selectedProvider = providerList[index][0] as DbProvider;
    } else {
      console.error('\nL Invalid selection');
      rl.close();
      process.exit(1);
    }
  }

  const config = dbProviders[selectedProvider];
  console.log(`\n Selected: ${config.name}\n`);

  // Show URL template
  console.log('=Ë Connection string format:');
  console.log(`   ${config.urlTemplate}\n`);

  // Get current DATABASE_URL from .env
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';
  let currentUrl = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/DATABASE_URL="([^"]*)"/);
    if (match) {
      currentUrl = match[1];
    }
  }

  if (currentUrl) {
    console.log('Current DATABASE_URL:');
    // Mask password in display
    const maskedUrl = currentUrl.replace(/:([^@]+)@/, ':****@');
    console.log(`   ${maskedUrl}\n`);
  }

  // Ask for new URL or use existing
  let databaseUrl = currentUrl;

  const updateUrl = await question('Enter new DATABASE_URL (or press Enter to keep current): ');
  if (updateUrl.trim()) {
    databaseUrl = updateUrl.trim();

    // Update .env
    if (envContent.includes('DATABASE_URL=')) {
      envContent = envContent.replace(
        /DATABASE_URL=.*/,
        `DATABASE_URL="${databaseUrl}"`
      );
    } else {
      envContent += `\n# Database\nDATABASE_URL="${databaseUrl}"\n`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log('\n Updated .env with new DATABASE_URL\n');
  }

  // Show setup instructions
  console.log('=Ë Setup Instructions:\n');
  config.setupInstructions.forEach((instruction) => {
    console.log(`  ${instruction}`);
  });

  // Update Prisma schema provider if needed
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  if (fs.existsSync(schemaPath)) {
    let schema = fs.readFileSync(schemaPath, 'utf-8');
    const currentProvider = schema.match(/provider\s*=\s*"(\w+)"/)?.[1];

    if (currentProvider !== config.prismaProvider) {
      console.log(`\n   Prisma schema uses "${currentProvider}" but selected provider needs "${config.prismaProvider}"`);

      const updateSchema = await question('Update Prisma schema? (y/N): ');
      if (updateSchema.toLowerCase() === 'y') {
        schema = schema.replace(
          /provider\s*=\s*"\w+"/,
          `provider = "${config.prismaProvider}"`
        );
        fs.writeFileSync(schemaPath, schema);
        console.log(' Updated Prisma schema provider\n');
      }
    }
  }

  // Test connection
  console.log('\n= Testing database connection...\n');

  try {
    execSync('npx prisma db pull --print 2>/dev/null', {
      stdio: 'pipe',
      env: { ...process.env, DATABASE_URL: databaseUrl },
    });
    console.log(' Database connection successful!\n');
  } catch {
    console.log('   Could not connect to database.');
    console.log('   Make sure the database exists and is running.\n');
  }

  rl.close();

  // Run prisma generate and db push
  if (!skipMigration) {
    const runMigration = await new Promise<boolean>((resolve) => {
      const rl2 = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl2.question('Run database migrations now? (Y/n): ', (answer) => {
        rl2.close();
        resolve(answer.toLowerCase() !== 'n');
      });
    });

    if (runMigration) {
      console.log('\n=æ Running Prisma generate...\n');
      try {
        execSync('npx prisma generate', { stdio: 'inherit' });
        console.log('\n Prisma client generated\n');
      } catch {
        console.error('L Failed to generate Prisma client\n');
      }

      console.log('=æ Pushing schema to database...\n');
      try {
        execSync('npx prisma db push', { stdio: 'inherit' });
        console.log('\n Database schema updated\n');
      } catch {
        console.error('L Failed to push schema to database\n');
      }
    }
  }

  console.log('Next steps:');
  console.log('  1. Verify database connection: npx prisma studio');
  console.log('  2. Create admin user: npx tsx scripts/setup/create-admin.ts');
  console.log('  3. Start the app: npm run dev\n');
}

main().catch(console.error);
