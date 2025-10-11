const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicIcons = require('../../UI/icons/musicicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Xem thông tin bài hát đang phát'),

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
            
            const currentTrack = player.current;
            if (!currentTrack) {
                const noTrackEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Không Có Track Đang Phát')
                    .setDescription('Không có track nào đang phát.\nSử dụng `/play` để thêm bài hát vào hàng đợi.')
                    .setFooter({ text: 'All In One Music', iconURL: musicIcons.alertIcon });
            
                const reply = await interaction.editReply({ embeds: [noTrackEmbed] });
                setTimeout(() => reply.delete().catch(() => {}), 3000);
                return;
            }
            
            const npEmbed = new EmbedBuilder()
                .setColor('#DC92FF')
                .setTitle('🎵 Đang Phát')
                .setDescription(`**[${currentTrack.info.title}](${currentTrack.info.uri})**`)
                .addFields(
                    { name: '🎤 Nghệ sĩ', value: currentTrack.info.author || 'Không xác định', inline: true },
                    { name: '⏱️ Thời lượng', value: this.formatTime(currentTrack.info.length), inline: true },
                    { name: '👤 Yêu cầu bởi', value: currentTrack.requester?.username || 'Không xác định', inline: true }
                );
            
            if (currentTrack.info.artwork) {
                npEmbed.setThumbnail(currentTrack.info.artwork);
            }
            
            const reply = await interaction.editReply({ embeds: [npEmbed] });
            setTimeout(() => reply.delete().catch(() => {}), 10000);
        } catch (error) {
            console.error('Error in nowplaying command:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Đã Xảy Ra Lỗi')
                .setDescription('Có lỗi xảy ra khi thực hiện lệnh. Vui lòng thử lại sau.')
                .setFooter({ text: 'All In One Music', iconURL: musicIcons.alertIcon });
            
            const reply = await interaction.editReply({ embeds: [errorEmbed] });
            setTimeout(() => reply.delete().catch(() => {}), 3000);
        }
    },

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
};
