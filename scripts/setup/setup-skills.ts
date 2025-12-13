#!/usr/bin/env npx tsx
/**
 * ShipKit Skills Installer
 * Installs Claude Skills to ~/.claude/skills/ for use with Claude Code
 *
 * Usage:
 *   npx tsx scripts/setup/setup-skills.ts
 *   npx tsx scripts/setup/setup-skills.ts --all
 *   npx tsx scripts/setup/setup-skills.ts shipkit-ui shipkit-api
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as readline from 'readline';

// =============================================================================
// CONFIGURATION
// =============================================================================

const SKILLS_SOURCE = path.join(process.cwd(), '.claude', 'skills');
const SKILLS_TARGET = path.join(os.homedir(), '.claude', 'skills');

const AVAILABLE_SKILLS = [
  {
    name: 'shipkit-ui',
    description: 'Frontend UI components and templates',
    size: '20+ templates',
  },
  {
    name: 'shipkit-api',
    description: 'Backend API route generation',
    size: '5+ templates',
  },
  {
    name: 'shipkit-db',
    description: 'Prisma schema and database patterns',
    size: '4+ patterns',
  },
  {
    name: 'shipkit-i18n',
    description: 'Internationalization management',
    size: '7 languages',
  },
  {
    name: 'shipkit-auth',
    description: 'Authentication patterns and templates',
    size: '4+ templates',
  },
  {
    name: 'shipkit-marketing',
    description: 'Marketing content generation',
    size: '12+ templates',
  },
];

// =============================================================================
// HELPERS
// =============================================================================

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const icons = {
    info: '📦',
    success: '✅',
    error: '❌',
    warn: '⚠️',
  };
  console.log(`${icons[type]} ${message}`);
}

function copyDir(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function countFiles(dir: string): number {
  if (!fs.existsSync(dir)) return 0;

  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }

  return count;
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// =============================================================================
// MAIN
// =============================================================================

async function installSkill(skillName: string): Promise<boolean> {
  const sourcePath = path.join(SKILLS_SOURCE, skillName);
  const targetPath = path.join(SKILLS_TARGET, skillName);

  if (!fs.existsSync(sourcePath)) {
    log(`Skill "${skillName}" not found in source`, 'error');
    return false;
  }

  // Check if already installed
  if (fs.existsSync(targetPath)) {
    log(`Skill "${skillName}" already installed, updating...`, 'warn');
    fs.rmSync(targetPath, { recursive: true, force: true });
  }

  try {
    copyDir(sourcePath, targetPath);
    const fileCount = countFiles(targetPath);
    log(`Installed "${skillName}" (${fileCount} files)`, 'success');
    return true;
  } catch (error) {
    log(`Failed to install "${skillName}": ${error}`, 'error');
    return false;
  }
}

async function main() {
  console.log('\n🎨 ShipKit Pro Skills Installer\n');
  console.log('This will install Claude Skills to ~/.claude/skills/');
  console.log('Skills enable Claude to generate code following ShipKit patterns.\n');

  // Parse arguments
  const args = process.argv.slice(2);

  // List available skills
  if (args.includes('--list') || args.includes('-l')) {
    console.log('Available skills:\n');
    for (const skill of AVAILABLE_SKILLS) {
      console.log(`  ${skill.name.padEnd(20)} - ${skill.description} (${skill.size})`);
    }
    console.log();
    return;
  }

  // Create target directory
  if (!fs.existsSync(SKILLS_TARGET)) {
    fs.mkdirSync(SKILLS_TARGET, { recursive: true });
    log(`Created ${SKILLS_TARGET}`, 'info');
  }

  // Determine which skills to install
  let skillsToInstall: string[] = [];

  if (args.includes('--all') || args.includes('-a')) {
    skillsToInstall = AVAILABLE_SKILLS.map((s) => s.name);
  } else if (args.length > 0) {
    skillsToInstall = args.filter((arg) => !arg.startsWith('-'));
  } else {
    // Interactive mode
    console.log('Select skills to install:\n');

    for (let i = 0; i < AVAILABLE_SKILLS.length; i++) {
      const skill = AVAILABLE_SKILLS[i];
      console.log(`  [${i + 1}] ${skill.name.padEnd(20)} - ${skill.description}`);
    }
    console.log(`  [a] Install all skills`);
    console.log(`  [q] Quit\n`);

    const answer = await prompt('Enter your choice (e.g., 1,2,3 or a): ');

    if (answer.toLowerCase() === 'q') {
      console.log('Installation cancelled.\n');
      return;
    }

    if (answer.toLowerCase() === 'a') {
      skillsToInstall = AVAILABLE_SKILLS.map((s) => s.name);
    } else {
      const indices = answer.split(',').map((s) => parseInt(s.trim()) - 1);
      skillsToInstall = indices
        .filter((i) => i >= 0 && i < AVAILABLE_SKILLS.length)
        .map((i) => AVAILABLE_SKILLS[i].name);
    }
  }

  if (skillsToInstall.length === 0) {
    log('No skills selected', 'warn');
    return;
  }

  console.log(`\nInstalling ${skillsToInstall.length} skill(s)...\n`);

  // Install skills
  let successCount = 0;
  for (const skillName of skillsToInstall) {
    if (await installSkill(skillName)) {
      successCount++;
    }
  }

  // Summary
  console.log('\n' + '─'.repeat(50));
  console.log(`\n✨ Installation complete!`);
  console.log(`   ${successCount}/${skillsToInstall.length} skills installed to ${SKILLS_TARGET}\n`);

  console.log('📝 Next steps:');
  console.log('   1. Start Claude Code in your project');
  console.log('   2. Ask Claude to use a skill: "Use the shipkit-ui skill to create a hero section"');
  console.log('   3. Claude will automatically load the skill and follow ShipKit patterns\n');

  console.log('💡 Tips:');
  console.log('   - Skills are loaded automatically when relevant');
  console.log('   - You can reference specific templates: "Use the pricing-cards template"');
  console.log('   - Run with --list to see all available skills\n');
}

main().catch(console.error);
