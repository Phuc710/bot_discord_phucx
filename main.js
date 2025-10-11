const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
require('dotenv').config();
const axios = require('axios');
const config = require('./config.json');
const colors = require('./UI/colors/colors');
const loadLogHandlers = require('./logHandlers');
const scanCommands = require('./utils/scanCommands');
const { EmbedBuilder, Partials } = require('discord.js');
const client = new Client({
    intents: Object.keys(GatewayIntentBits).map((a) => {
        return GatewayIntentBits[a];
    }),
    partials: [Partials.Channel]
});
const { connectToDatabase } = require('./mongodb');
client.commands = new Collection();
require('events').defaultMaxListeners = 100;


const loadEvents = require('./handlers/events');


loadEvents(client);


async function fetchExpectedCommandsCount() {
    try {
        const response = await axios.get('https://server-backend-tdpa.onrender.com/api/expected-commands-count');
        return response.data.expectedCommandsCount;
    } catch (error) {
        return -1;
    }
}

async function verifyCommandsCount() {

    console.log('\n' + '─'.repeat(60));
    console.log(`${colors.yellow}${colors.bright}             🔍 KIỂM TRA BẢO MẬT 🔍${colors.reset}`);
    console.log('─'.repeat(60));

    const expectedCommandsCount = await fetchExpectedCommandsCount();
    const registeredCommandsCount = scanCommands(config);


    if (expectedCommandsCount === -1) {
        console.log(`${colors.yellow}[ CẢNH BÁO ]${colors.reset} ${colors.red}Trạng Thái Server: OFFLINE ❌${colors.reset}`);
        console.log(`${colors.yellow}[ CẢNH BÁO ]${colors.reset} ${colors.red}Không thể xác minh lệnh${colors.reset}`);
        return;
    }


    if (registeredCommandsCount !== expectedCommandsCount) {
        console.log(`${colors.yellow}[ CẢNH BÁO ]${colors.reset} ${colors.red}Phát hiện lệnh không khớp ⚠️${colors.reset}`);
        console.log(`${colors.yellow}[ CHI TIẾT ]${colors.reset} ${colors.red}Lệnh hiện tại: ${colors.reset}${registeredCommandsCount}`);
        console.log(`${colors.yellow}[ CHI TIẾT ]${colors.reset} ${colors.red}Lệnh mong đợi: ${colors.reset}${expectedCommandsCount}`);
        console.log(`${colors.yellow}[ TRẠNG THÁI ]${colors.reset} ${colors.red}Cần kiểm tra tính toàn vẹn lệnh${colors.reset}`);
    } else {
        console.log(`${colors.cyan}[ LỆNH BOT ]${colors.reset} ${colors.green}Số lượng lệnh: ${registeredCommandsCount} ✓${colors.reset}`);
        console.log(`${colors.cyan}[ BẢO MẬT ]${colors.reset} ${colors.green}Tính toàn vẹn lệnh đã xác minh ✅${colors.reset}`);
        console.log(`${colors.cyan}[ TRẠNG THÁI ]${colors.reset} ${colors.green}Bot đã bảo mật và sẵn sàng 🛡️${colors.reset}`);
    }

    // Footer
    console.log('─'.repeat(60));
}
const fetchAndRegisterCommands = async () => {
    try {
        const response = await axios.get('https://server-backend-tdpa.onrender.com/api/commands');
        const commands = response.data;

        commands.forEach(command => {
            command.source = 'shiva';
            client.commands.set(command.name, {
                ...command,
                execute: async (interaction) => {
                    try {
                        const embed = new EmbedBuilder()
                            .setTitle(command.embed.title)
                            .setDescription(command.embed.description)
                            .setImage(command.embed.image)
                            .addFields(command.embed.fields)
                            .setColor(command.embed.color)
                            .setFooter({
                                text: command.embed.footer.text,
                                iconURL: command.embed.footer.icon_url
                            })
                            .setAuthor({
                                name: command.embed.author.name,
                                iconURL: command.embed.author.icon_url
                            });

                        await interaction.reply({ embeds: [embed] });
                    } catch (error) {
                        //console.error(`Error executing command ${command.name}:`, error);
                        //await interaction.reply('Failed to execute the command.');
                    }
                }
            });
        });
        //console.log('Commands fetched and registered successfully.');
    } catch (error) {
        //console.error('Error fetching commands:', error);
    }
};

require('./handlers/security')(client);     
require('./handlers/applications')(client); 
require('./handlers/server');  
require('./handlers/economyScheduler')(client);

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN || config.token);

client.once('ready', async () => {
    console.log('\n' + '─'.repeat(40));
    console.log(`${colors.magenta}${colors.bright}👾  THÔNG TIN BOT${colors.reset}`);
    console.log('─'.repeat(40));
    console.log(`${colors.red}[ LÕI BOT ]${colors.reset} ${colors.green}Tên Bot:  ${colors.reset}${client.user.tag}`);
    console.log(`${colors.red}[ LÕI BOT ]${colors.reset} ${colors.green}Client ID: ${colors.reset}${client.user.id}`);
    console.log(`${colors.red}[ LÕI BOT ]${colors.reset} ${colors.green}Trạng thái: ${colors.reset}✅ Đang hoạt động`);

    loadLogHandlers(client);

    try {
        await verifyCommandsCount();
        await fetchAndRegisterCommands();
        await require('./handlers/commands')(client, config, colors);


    } catch (error) {
        console.log(`${colors.red}[ LỖI HỆ THỐNG ]${colors.reset} ${colors.red}${error}${colors.reset}`);
    }
});




connectToDatabase().then(() => {
    console.log(`${colors.green}[ CƠ SỞ DỮ LIỆU ]${colors.reset} ${colors.green}MongoDB đã online và sẵn sàng ✅${colors.reset}`);
}).catch((error) => {
    console.error(`${colors.red}[ LỖI DATABASE ]${colors.reset} ${colors.red}Không thể kết nối MongoDB:${colors.reset}`, error.message);
});


const botToken = process.env.TOKEN || config.token;
if (!botToken) {
    console.error(`${colors.red}[ ERROR ]${colors.reset} ${colors.red}No bot token found in environment variables or config${colors.reset}`);
    process.exit(1);
}

// Xử lý tắt bot an toàn
process.on('SIGINT', () => {
    console.log(`\n${colors.yellow}[ TẮT BOT ]${colors.reset} ${colors.yellow}Đang tắt bot một cách an toàn... 🛑${colors.reset}`);
    console.log(`${colors.cyan}[ TẠM BIỆT ]${colors.reset} ${colors.cyan}Cảm ơn bạn đã sử dụng Boo Bot! 🚀${colors.reset}`);
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log(`\n${colors.yellow}[ TẮT BOT ]${colors.reset} ${colors.yellow}Đang tắt bot một cách an toàn... 🛑${colors.reset}`);
    console.log(`${colors.cyan}[ TẠM BIỆT ]${colors.reset} ${colors.cyan}Cảm ơn bạn đã sử dụng Boo Bot! 🚀${colors.reset}`);
    client.destroy();
    process.exit(0);
});

client.login(botToken);

module.exports = client;

