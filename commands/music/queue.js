const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicIcons = require('../../UI/icons/musicicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Xem hàng đợi nhạc hiện tại'),

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
            
            const queue = player.queue;
            if (!queue || queue.length === 0) {
                const emptyQueueEmbed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('📭 Hàng Đợi Trống')
                    .setDescription('Hàng đợi hiện tại đang trống.\nSử dụng `/play` để thêm bài hát.')
                    .setFooter({ text: 'All In One Music', iconURL: musicIcons.alertIcon });
            
                const reply = await interaction.editReply({ embeds: [emptyQueueEmbed] });
                setTimeout(() => reply.delete().catch(() => {}), 3000);
                return;
            }
            
            // Hiển thị tối đa 10 bài hát đầu tiên
            const maxDisplay = 10;
            const displayQueue = queue.slice(0, maxDisplay);
            
            // Định dạng hàng đợi với số thứ tự và tên bài hát
            const formattedQueue = displayQueue.map((track, i) => {
                const requester = track.requester?.username || 'Không xác định';
                return `${i + 1}. **${track.info.title}**\n   👤 ${requester}`;
            }).join('\n\n');
            
            const queueEmbed = new EmbedBuilder()
                .setColor('#DC92FF')
                .setTitle('🎶 Hàng Đợi Hiện Tại')
                .setDescription(formattedQueue)
                .setFooter({ 
                    text: queue.length > maxDisplay 
                        ? `Hiển thị ${maxDisplay}/${queue.length} bài hát • Sử dụng /play để thêm bài hát` 
                        : `Tổng cộng ${queue.length} bài hát • Sử dụng /play để thêm bài hát`
                });
            
            await interaction.editReply({ embeds: [queueEmbed] });
        } catch (error) {
            console.error('Error in queue command:', error);
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
