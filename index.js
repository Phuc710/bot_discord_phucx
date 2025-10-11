// Xử lý lỗi toàn cục
const colors = require('./UI/colors/colors');

process.on('uncaughtException', (error) => {
    console.error(`${colors.red}[ LỖI KHÔNG XỪ LÝ ]${colors.reset} ${colors.red}Lỗi không được xử lý:${colors.reset}`, error.message);
    console.log(`${colors.yellow}[ TẮT BOT ]${colors.reset} ${colors.yellow}Bot đang tắt do lỗi nghiêm trọng... 🛑${colors.reset}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(`${colors.red}[ LỖI PROMISE ]${colors.reset} ${colors.red}Promise không được xử lý:${colors.reset}`, reason?.message || reason);
    console.log(`${colors.yellow}[ CẢNH BÁO ]${colors.reset} ${colors.yellow}Bot tiếp tục hoạt động nhưng cần kiểm tra lỗi${colors.reset}`);
    // Không tắt bot, chỉ log error
});

// Kiểm tra phiên bản Node.js
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
    console.error(`${colors.red}[ LỖI ]${colors.reset} ${colors.red}Phiên bản Node.js ${nodeVersion} quá cũ. Vui lòng cập nhật lên Node.js 16 trở lên.${colors.reset}`);
    process.exit(1);
}

// Load environment variables
require('dotenv').config();

const client = require('./main');
require('./shiva');

const loadEventHandlers = () => {
    const colors = require('./UI/colors/colors');

   
    const logSystem = (system, status = '✅') => {
        const timestamp = new Date().toLocaleTimeString();
        console.log(
            `${colors.gray}[${timestamp}]${colors.reset}`,
            `${colors.cyan}[${system.padEnd(15)}]${colors.reset}`,
            `${colors.green}${status}${colors.reset}`
        );
    };

   
    console.clear();
    
  
    const currentDate = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN');

    // Banner đẹp cho bot Việt Nam
    console.log('\n' + '═'.repeat(65));
    console.log(`${colors.yellow}${colors.bright}           🇻🇳 BỘ KHỚI TẠO HỆ THỐNG BOO BOT 🇻🇳${colors.reset}`);
    console.log(`${colors.cyan}                    Dành riêng cho cộng đồng người Việt${colors.reset}`);
    console.log('═'.repeat(65));
    console.log(`${colors.gray}             Thời gian khởi tạo: ${colors.cyan}${currentDate}${colors.reset}`);
    console.log('═'.repeat(65) + '\n');

   
    console.log(`\n${colors.magenta}${colors.bright}📡 HỆ THỐNG LÕI CHÍNH${colors.reset}`);
    console.log('─'.repeat(45));


  
    const ticketHandler = require('./events/ticketHandler');
    ticketHandler(client);
    logSystem('TICKET');

    const modmailHandler = require('./events/modmailHandler');
    modmailHandler(client);
    logSystem('MODMAIL');

    const voiceChannelHandler = require('./events/voiceChannelHandler');
    voiceChannelHandler(client);
    logSystem('VOICE');

    console.log(`\n${colors.magenta}${colors.bright}🎮 HỆ THỐNG TƯƠNG TÁC${colors.reset}`);
    console.log('─'.repeat(45));

   
    const giveawayHandler = require('./events/giveaway');
    giveawayHandler(client);
    logSystem('GIVEAWAY - TẶNG QUÀ');

 
    const autoroleHandler = require('./events/autorole');
    autoroleHandler(client);
    logSystem('AUTOROLE - Tự ĐỘNG VAI TRÒ');

    const reactionRoleHandler = require('./events/reactionroles');
    reactionRoleHandler(client);
    logSystem('REACTION ROLES - VAI TRÒ EMOJI');

    console.log(`\n${colors.magenta}${colors.bright}😀 HỆ THỐNG EMOJI & AFK${colors.reset}`);
    console.log('─'.repeat(45));

   
    const nqnHandler = require('./events/nqn');
    nqnHandler(client);
    logSystem('NQN');
    
    
    const afkHandler = require('./events/afkHandler');
    afkHandler(client);
    logSystem('AFK');
    
    const centralMusicHandler = require('./events/centralMusicHandler');
    centralMusicHandler(client);
    logSystem('CENTRAL MUSIC');

    console.log(`\n${colors.magenta}${colors.bright}🔔 HỆ THỐNG THÔNG BÁO${colors.reset}`);
    console.log('─'.repeat(45));

 
    const startYouTubeNotifications = require('./events/youTubeHandler');
    const startTwitchNotifications = require('./events/twitchHandler');
    const startFacebookNotifications = require('./events/facebookHandler');
    const startInstagramNotifications = require('./events/instagramHandler');

    startYouTubeNotifications(client);
    logSystem('YOUTUBE - THEO DÕI VIDEO');
    
    startTwitchNotifications(client);
    logSystem('TWITCH - THEO DÕI STREAM');
    
    startFacebookNotifications(client);
    logSystem('FACEBOOK - THEO DÕI BÀI VIẾT');
    
    startInstagramNotifications(client);
    logSystem('INSTAGRAM - THEO DÕI ẢNH');

  
    console.log(`\n${colors.magenta}${colors.bright}🎵 HỆ THỐNG ÂM NHẠC${colors.reset}`);
    console.log('─'.repeat(45));
    require('./events/music')(client);
    logSystem('LAVALINK - ÂM NHẠC CHẤT LƯỢNG CAO');

    require('./shiva');
    console.log(`\n${colors.magenta}${colors.bright}🎵 HỆ THỐNG DISTUBE${colors.reset}`);
    require('./handlers/distube')(client);
    logSystem('DISTUBE - PHÁT NHẠC ĐA NĂNG');
   
    console.log('\n' + '═'.repeat(65));
    console.log(`${colors.green}${colors.bright}           ✨ TẤT CẢ HỆ THỐNG ĐÃ KHỚI TẠO THÀNH CÔNG ✨${colors.reset}`);
    console.log(`${colors.cyan}                       Boo Bot sẵn sàng phục vụ cộng đồng Việt! 🇻🇳${colors.reset}`);
    console.log('═'.repeat(65) + '\n');

 
    console.log(`${colors.green}${colors.bright}Trạng thái: ${colors.reset}${colors.green}Tất cả hệ thống hoạt động bình thường 🚀${colors.reset}`);
    console.log(`${colors.gray}Kiểm tra cuối: ${colors.reset}${colors.cyan}${new Date().toLocaleString('vi-VN')}${colors.reset}`);
    console.log(`${colors.yellow}Phát triển bởi: ${colors.reset}${colors.magenta}Phucx - Made with ❤️ for Vietnam${colors.reset}\n`);
};

// Load event handlers when client is ready
// Use 'ready' event temporarily for compatibility, then switch to clientReady after bot is stable
if (client && typeof client.on === 'function') {
    let eventHandlersLoaded = false;
    
    // Try clientReady first (Discord.js v14+)
    client.on('ready', () => {
        if (!eventHandlersLoaded) {
            eventHandlersLoaded = true;
            loadEventHandlers();
        }
    });
} else {
    console.error(`${colors.red}[ LỖI ]${colors.reset} ${colors.red}Client chưa được khởi tạo đúng cách!${colors.reset}`);
    process.exit(1);
}
