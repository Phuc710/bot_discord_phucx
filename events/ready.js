const { ActivityType } = require('discord.js');
const { botStatusCollection } = require('../mongodb');
const colors = require('../UI/colors/colors');
const config = require('../config'); // Sử dụng config.js

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('\n' + '─'.repeat(45));
        console.log(`${colors.magenta}${colors.bright}🔗  TRẠNG THÁI HOẠT ĐỘNG BOT${colors.reset}`);
        console.log('─'.repeat(45));

        let defaultIndex = 0;
        let customIndex = 0;
        let currentInterval = 30000; // 30 seconds instead of 10

        async function getCustomStatus() {
            const statusDoc = await botStatusCollection.findOne({});
            if (!statusDoc || !statusDoc.useCustom || !statusDoc.customRotation || statusDoc.customRotation.length === 0) {
                return null;
            }

       
            if (statusDoc.interval) {
                currentInterval = statusDoc.interval * 1000;
            }

          
            const status = statusDoc.customRotation[customIndex];
            customIndex = (customIndex + 1) % statusDoc.customRotation.length;

    
            const placeholders = {
                '{members}': client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
                '{servers}': client.guilds.cache.size,
                '{channels}': client.channels.cache.size,
            };

            const resolvedActivity = Object.entries(placeholders).reduce(
                (text, [key, val]) => text.replace(new RegExp(key, 'g'), val),
                status.activity
            );

            const activity = {
                name: resolvedActivity,
                type: ActivityType[status.type],
            };

            if (status.type === 'Streaming' && status.url) {
                activity.url = status.url;
            }

            return { activity, status: status.status };
        }

        async function getCurrentSongActivity() {
            // Check if Riffy is initialized
            if (!client.riffy || !client.riffy.players) return null;
            
            const activePlayers = Array.from(client.riffy.players.values()).filter(player => player.playing);

            if (!activePlayers.length) return null;

            const player = activePlayers[0];
            if (!player.current?.info?.title) return null;

            return {
                name: `🎸 ${player.current.info.title}`,
                type: ActivityType.Playing
            };
        }

        async function updateStatus() {
            try {
                // Kiểm tra cấu hình status
                if (!config.status) {
                    console.log(`${colors.yellow}[ CẢNH BÁO ]${colors.reset} ${colors.yellow}Không tìm thấy cấu hình status trong config.js${colors.reset}`);
                    return;
                }
                

                const customStatus = await getCustomStatus();
                
                if (customStatus) {
                    client.user.setPresence({
                        activities: [customStatus.activity],
                        status: customStatus.activity.type === ActivityType.Streaming ? undefined : customStatus.status
                    });
                    return;
                }

                // Kiểm tra nếu có songStatus và được bật
                if (config.status.songStatus) {
                    const songActivity = await getCurrentSongActivity();
                    if (songActivity) {
                        client.user.setActivity(songActivity);
                        return;
                    }
                }

                // Sử dụng status mặc định
                if (config.status.rotateDefault && config.status.rotateDefault.length > 0) {
                    const next = config.status.rotateDefault[defaultIndex % config.status.rotateDefault.length];
                    
                    // Xử lý placeholders
                    const placeholders = {
                        '{members}': client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
                        '{servers}': client.guilds.cache.size,
                        '{channels}': client.channels.cache.size,
                    };

                    let statusName = next.name;
                    Object.entries(placeholders).forEach(([key, val]) => {
                        statusName = statusName.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), val);
                    });

                    client.user.setPresence({
                        activities: [{
                            name: statusName,
                            type: next.type || ActivityType.Playing
                        }],
                        status: 'online'
                    });
                    defaultIndex++;
                } else {
                    // Fallback status
                    client.user.setPresence({
                        activities: [{
                            name: '🇻🇳 Boo Bot - Dành cho Việt Nam',
                            type: ActivityType.Playing
                        }],
                        status: 'online'
                    });
                }
            } catch (error) {
                console.error(`${colors.red}[ LỖI STATUS ]${colors.reset} ${colors.red}Lỗi cập nhật trạng thái bot:${colors.reset}`, error.message);
                // Fallback status khi gặp lỗi
                try {
                    client.user.setPresence({
                        activities: [{
                            name: '🚀 Boo Bot Online',
                            type: ActivityType.Playing
                        }],
                        status: 'online'
                    });
                } catch (fallbackError) {
                    console.error(`${colors.red}[ LỖI CẤP ĐỘ 2 ]${colors.reset} ${colors.red}Không thể đặt status fallback${colors.reset}`);
                }
            }
        }

        
        // Khởi tạo hệ thống invite tracking
        console.log(`${colors.cyan}[ INVITE SYSTEM ]${colors.reset} ${colors.cyan}Đang khởi tạo hệ thống theo dõi invite...${colors.reset}`);
        client.invites = new Map();
        let successfulGuilds = 0;
        let totalGuilds = client.guilds.cache.size;

        for (const [guildId, guild] of client.guilds.cache) {
            try {
                await new Promise(res => setTimeout(res, 300)); // Giảm delay
                const invites = await guild.invites.fetch();
                client.invites.set(
                    guildId,
                    new Map(invites.map(inv => [
                        inv.code,
                        {
                            inviterId: inv.inviter?.id || null,
                            uses: inv.uses
                        }
                    ]))
                );
                successfulGuilds++;
            } catch (err) {
                // Chỉ log vào debug mode
                if (process.env.NODE_ENV === 'development') {
                    console.warn(`${colors.yellow}[ DEBUG ]${colors.reset} ${colors.yellow}Không thể lấy invite cho ${guild.name}: ${err.message}${colors.reset}`);
                }
            }
        }
        
        console.log(`${colors.green}[ INVITE SYSTEM ]${colors.reset} ${colors.green}Đã khởi tạo thành công cho ${successfulGuilds}/${totalGuilds} server${colors.reset}`);

      
        updateStatus();
        
      
        async function checkAndUpdateInterval() {
            try {
                const statusDoc = await botStatusCollection.findOne({});
                const newInterval = statusDoc?.interval ? statusDoc.interval * 1000 : 30000;
                
                if (newInterval !== currentInterval) {
                    console.log(`${colors.cyan}[ STATUS ]${colors.reset} ${colors.cyan}Cập nhật chu kỳ: ${newInterval / 1000} giây${colors.reset}`);
                    currentInterval = newInterval;
                }
                
                setTimeout(() => {
                    updateStatus()
                        .then(() => checkAndUpdateInterval())
                        .catch((error) => {
                            console.error(`${colors.red}[ LỖI UPDATE ]${colors.reset} ${colors.red}Lỗi trong chu kỳ cập nhật:${colors.reset}`, error.message);
                            // Tiếp tục chu kỳ dù có lỗi
                            setTimeout(() => checkAndUpdateInterval(), 30000);
                        });
                }, currentInterval);
            } catch (error) {
                console.error(`${colors.red}[ LỖI INTERVAL ]${colors.reset} ${colors.red}Lỗi kiểm tra interval:${colors.reset}`, error.message);
                // Sử dụng interval mặc định nếu có lỗi
                setTimeout(() => {
                    updateStatus()
                        .then(() => checkAndUpdateInterval())
                        .catch(() => setTimeout(() => checkAndUpdateInterval(), 10000));
                }, 10000);
            }
        }
        
       
        checkAndUpdateInterval();

        console.log(`${colors.green}[ LÕI BOT ]${colors.reset} ${colors.green}Chu kỳ hoạt động bot đang chạy ✅${colors.reset}`);
        console.log(`${colors.cyan}[ THÔNG TIN ]${colors.reset} ${colors.cyan}Bot sẵn sàng phục vụ cộng đồng Việt Nam! 🇻🇳${colors.reset}`);
    }
};
