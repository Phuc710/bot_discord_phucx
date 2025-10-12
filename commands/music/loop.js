const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicIcons = require('../../UI/icons/musicicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Bật/tắt chế độ lặp lại')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Chọn chế độ lặp: none, track, hoặc queue')
                .setRequired(true)
                .addChoices(
                    { name: 'Tắt Lặp', value: 'none' },
                    { name: 'Lặp Track', value: 'track' },
                    { name: 'Lặp Queue', value: 'queue' }
                )),

    async execute(interaction) {
        try {
            await interaction.deferReply();
            const client = interaction.client;
            const guildId = interaction.guild.id;
            const mode = interaction.options.getString('mode');

            // Kiểm tra player có tồn tại không
            const player = client.riffy.players.get(guildId);
            
            if (!player) {
                const noPlayerEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Không Có Player Hoạt Động')
                    .setDescription('Không có music player nào đang hoạt động trong server này.\nSử dụng `/play` để bắt đầu phát nhạc.')
                    .setFooter({ text: 'PHUCX Music Bot', iconURL: musicIcons.alertIcon });
            
                const reply = await interaction.editReply({ embeds: [noPlayerEmbed] });
                setTimeout(() => reply.delete().catch(() => {}), 3000);
                return;
            }
            
            try {
                player.setLoop(mode);
                
                const modeText = {
                    'none': 'Tắt',
                    'track': 'Lặp Track',
                    'queue': 'Lặp Queue'
                };
                
                const embed = new EmbedBuilder()
                    .setColor('#DC92FF')
                    .setTitle('🔄 Chế Độ Lặp Đã Thay Đổi')
                    .setDescription(`Chế độ lặp đã được đặt thành: **${modeText[mode]}**`)
                    .setFooter({ text: `Yêu cầu bởi: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });
                
                const reply = await interaction.editReply({ embeds: [embed] });
                setTimeout(() => reply.delete().catch(() => {}), 3000);
            } catch (error) {
                console.error('Error setting loop mode:', error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Không Thể Đặt Chế Độ Lặp')
                    .setDescription('Không thể đặt chế độ lặp. Vui lòng thử lại sau.')
                    .setFooter({ text: 'PHUCX Music Bot', iconURL: musicIcons.alertIcon });
                
                const reply = await interaction.editReply({ embeds: [errorEmbed] });
                setTimeout(() => reply.delete().catch(() => {}), 3000);
            }
        } catch (error) {
            console.error('Error in loop command:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Đã Xảy Ra Lỗi')
                .setDescription('Có lỗi xảy ra khi thực hiện lệnh. Vui lòng thử lại sau.')
                .setFooter({ text: 'PHUCX Music Bot', iconURL: musicIcons.alertIcon });
            
            const reply = await interaction.editReply({ embeds: [errorEmbed] });
            setTimeout(() => reply.delete().catch(() => {}), 3000);
        }
    }
};
