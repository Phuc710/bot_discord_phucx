const fs = require('fs');
const path = require('path');

// Danh sách các file cần sửa
const filesToFix = [
    'commands/distube/play.js',
    'commands/media/images.js',
    'commands/utility/embed.js',
    'commands/media/gifs1.js',
    'commands/utility/show-emojis.js',
    'commands/media/gifs2.js',
    'commands/media/gifs3.js',
    'commands/utility/time.js',
    'commands/media/gifs4.js',
    'commands/media/gifs5.js'
];

let totalFixed = 0;

filesToFix.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${file}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Sửa các pattern lỗi
    content = content.replace(/flags: 64 \/\/ InteractionResponseFlags\.Ephemeral \}/g, 'flags: 64 }');
    content = content.replace(/flags: 64 \/\/ InteractionResponseFlags\.Ephemeral \)/g, 'flags: 64 )');
    content = content.replace(/, flags: 64 \/\/ InteractionResponseFlags\.Ephemeral/g, ', flags: 64');
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${file}`);
        totalFixed++;
    } else {
        console.log(`⚠️  No changes needed: ${file}`);
    }
});

console.log(`\n🎉 Total files fixed: ${totalFixed}`);
