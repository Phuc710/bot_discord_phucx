const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicIcons = require('../../UI/icons/musicicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Xáo trộn hàng đợi nhạc'),

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
                    .setFooter({ text: 'PHUCX Music Bot', iconURL: musicIcons.alertIcon });
            
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
                    .setFooter({ text: 'PHUCX Music Bot', iconURL: musicIcons.alertIcon });
            
                const reply = await interaction.editReply({ embeds: [emptyQueueEmbed] });
                setTimeout(() => reply.delete().catch(() => {}), 3000);
                return;
            }
            
            player.queue.shuffle();
            
            const embed = new EmbedBuilder()
                .setColor('#DC92FF')
                .setTitle('🔀 Đã Xáo Trộn')
                .setDescription(`Hàng đợi đã được xáo trộn với **${queue.length}** bài hát.`)
                .setFooter({ text: `Yêu cầu bởi: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });
            
            const reply = await interaction.editReply({ embeds: [embed] });
            setTimeout(() => reply.delete().catch(() => {}), 3000);
        } catch (error) {
            console.error('Error in shuffle command:', error);
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
