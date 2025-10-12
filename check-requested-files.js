const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

console.log(`${colors.cyan}🔍 CHECKING REQUESTED FILES${colors.reset}\n`);

// Files to check
const filesToCheck = [
    './commands/basic/help.js',
    './commands/core/riot.js',
    './commands/core/steam.js',
    './commands/fun/friendship.js',
    './commands/fun/joke.js',
    './commands/moderation/qurantine.js',  // Note: typo in filename
    './commands/fun/8ball.js',
    './commands/fun/MathQuiz.js',
    './commands/fun/WordScramble.js',
    './commands/fun/choose.js',
    './commands/fun/fact.js',
    './commands/fun/flip.js',
    './commands/fun/game.js',
    './commands/fun/meme.js',
    './commands/fun/quote.js',
    './commands/fun/randomnumber.js',
    './commands/fun/rate.js',
    './commands/fun/rockpaperscissor.js',
    './commands/fun/roll.js',
    './commands/fun/say.js'
];

// Header pattern to remove
const headerPattern = /\/\*[\s\S]*?☆\.。\.:.*?☆\.。\.:.*?☆[\s\S]*?\*\/\s*/g;

let totalChecked = 0;
let totalFixed = 0;
let totalErrors = 0;

for (const filePath of filesToCheck) {
    if (!fs.existsSync(filePath)) {
        console.log(`${colors.yellow}⚠️  ${path.basename(filePath)}: Not found${colors.reset}`);
        continue;
    }
    
    totalChecked++;
    
    try {
        // Check syntax
        try {
            execSync(`node -c "${filePath}"`, { stdio: 'pipe' });
        } catch (syntaxError) {
            console.log(`${colors.red}❌ ${path.basename(filePath)}: Syntax Error${colors.reset}`);
            totalErrors++;
            continue;
        }
        
        // Check for headers and ephemeral
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        let changed = false;
        
        // Remove headers
        if (headerPattern.test(content)) {
            content = content.replace(headerPattern, '');
            changed = true;
        }
        
        // Fix ephemeral
        if (/ephemeral:\s*true/.test(content)) {
            content = content.replace(/ephemeral:\s*true/g, 'flags: 64');
            changed = true;
        }
        
        // Fix inline comments
        if (/flags:\s*64\s*\/\//.test(content)) {
            content = content.replace(/(flags:\s*64)\s*\/\/([^\n]*?)(\s*\}\))/g, '$1 $3; //$2');
            content = content.replace(/(flags:\s*64)\s*\/\/([^\n]*?)(\s*\}[,\s])/g, '$1 $3; //$2');
            changed = true;
        }
        
        if (changed) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`${colors.green}✅ ${path.basename(filePath)}: Fixed & cleaned${colors.reset}`);
            totalFixed++;
        } else {
            console.log(`${colors.cyan}✓  ${path.basename(filePath)}: OK${colors.reset}`);
        }
        
    } catch (error) {
        console.log(`${colors.red}❌ ${path.basename(filePath)}: ${error.message}${colors.reset}`);
        totalErrors++;
    }
}

console.log(`\n${colors.cyan}═══════════════════════════════${colors.reset}`);
console.log(`${colors.cyan}📂 Total Checked: ${totalChecked}${colors.reset}`);
console.log(`${colors.green}✅ Fixed: ${totalFixed}${colors.reset}`);
console.log(`${colors.yellow}✓  Already OK: ${totalChecked - totalFixed - totalErrors}${colors.reset}`);
console.log(`${colors.red}❌ Errors: ${totalErrors}${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════${colors.reset}\n`);