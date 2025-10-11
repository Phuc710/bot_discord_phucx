const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicIcons = require('../../UI/icons/musicicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Xóa bài hát cụ thể khỏi hàng đợi')
        .addIntegerOption(option =>
            option.setName('track')
                .setDescription('Số thứ tự bài hát cần xóa')
                .setRequired(true)
                .setMinValue(1)),

    async execute(interaction) {
        try {
            await interaction.deferReply();
            const client = interaction.client;
            const guildId = interaction.guild.id;
            const trackNumber = interaction.options.getInteger('track');

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
            
            if (trackNumber < 1 || trackNumber > queue.length) {
                const invalidTrackEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Số Thứ Tự Không Hợp Lệ')
                    .setDescription(`Vui lòng nhập số từ 1 đến ${queue.length}.`)
                    .setFooter({ text: 'All In One Music', iconURL: musicIcons.alertIcon });
            
                const reply = await interaction.editReply({ embeds: [invalidTrackEmbed] });
                setTimeout(() => reply.delete().catch(() => {}), 3000);
                return;
            }
            
            const removedTrack = queue[trackNumber - 1];
            player.queue.remove(trackNumber - 1);
            
            const embed = new EmbedBuilder()
                .setColor('#DC92FF')
                .setTitle('🗑️ Đã Xóa Bài Hát')
                .setDescription(`Đã xóa bài hát #${trackNumber}: **${removedTrack.info.title}** khỏi hàng đợi.`)
                .setFooter({ text: `Yêu cầu bởi: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });
            
            const reply = await interaction.editReply({ embeds: [embed] });
            setTimeout(() => reply.delete().catch(() => {}), 3000);
        } catch (error) {
            console.error('Error in remove command:', error);
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
