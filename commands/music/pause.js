const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicIcons = require('../../UI/icons/musicicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Tạm dừng bài hát đang phát'),

    async execute(interaction) {
        try {
            await interaction.deferReply();
            const client = interaction.client;
            const guildId = interaction.guild.id;

            // Kiểm tra player có tồn tại không
            const player = client.riffy.players.get(guildId);
            
            if (!player) {
                const noPlayerEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Không Có Player Hoạt Động')
                    .setDescription('Không có music player nào đang hoạt động trong server này.\nSử dụng `/play` để bắt đầu phát nhạc.')
                    .setFooter({ text: 'All In One Music', iconURL: musicIcons.alertIcon });
            
                const reply = await interaction.editReply({ embeds: [noPlayerEmbed] });
                setTimeout(() => reply.delete().catch(() => {}), 3000);
                return;
            }

            if (player.paused) {
                const alreadyPausedEmbed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('⏸️ Đã Tạm Dừng')
                    .setDescription('Bài hát đã được tạm dừng rồi.')
                    .setFooter({ text: 'All In One Music', iconURL: musicIcons.alertIcon });
            
                const reply = await interaction.editReply({ embeds: [alreadyPausedEmbed] });
                setTimeout(() => reply.delete().catch(() => {}), 3000);
                return;
            }
            
            player.pause(true);
            const reply = await interaction.editReply({ content: '⏸️ Bài hát đã được tạm dừng.' });
            setTimeout(() => reply.delete().catch(() => {}), 3000);
        } catch (error) {
            console.error('Error in pause command:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Đã Xảy Ra Lỗi')
                .setDescription('Có lỗi xảy ra khi thực hiện lệnh. Vui lòng thử lại sau.')
                .setFooter({ text: 'All In One Music', iconURL: musicIcons.alertIcon });
            
            const reply = await interaction.editReply({ embeds: [errorEmbed] });
            setTimeout(() => reply.delete().catch(() => {}), 3000);
        }
    }
};
