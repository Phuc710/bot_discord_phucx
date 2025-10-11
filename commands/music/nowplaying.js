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
            
            // Tạo progress bar animation
            const progress = Math.floor((player.position / currentTrack.info.length) * 100);
            const progressBar = this.createProgressBar(progress);
            const currentTime = this.formatTime(player.position);
            const totalTime = this.formatTime(currentTrack.info.length);
            
            // Animation emojis
            const musicEmojis = ['🎵', '🎶', '🎼', '🎹', '🎸', '🥁', '🎺', '🎷'];
            const randomEmoji = musicEmojis[Math.floor(Math.random() * musicEmojis.length)];
            
            const npEmbed = new EmbedBuilder()
                .setColor('#00D4FF')
                .setTitle(`${randomEmoji} Now Playing.. 🎧`)
                .setDescription(`### ${currentTrack.info.title}\n\n${progressBar}\n**${currentTime}** ━━●━━━━━━━━ **${totalTime}**`)
                .addFields(
                    { name: '🎤 Artist', value: `\`${currentTrack.info.author || 'Unknown'}\``, inline: true },
                    { name: '⏱️ Length', value: `\`${totalTime}\``, inline: true },
                    { name: '🔊 Stream', value: currentTrack.info.isStream ? '🔴 **Live**' : '🟢 **Track**', inline: true },
                    { name: '🔍 Seekable', value: currentTrack.info.isSeekable ? '✅ **Yes**' : '❌ **No**', inline: true },
                    { name: '🌐 Source', value: `\`${currentTrack.info.sourceName || 'youtube'}\``, inline: true },
                    { name: '👤 Requested by', value: `<@${currentTrack.requester?.id || interaction.user.id}>`, inline: true }
                )
                .setFooter({ 
                    text: '🎼 Let the Beat Drop! • Boo Music Bot', 
                    iconURL: interaction.client.user.displayAvatarURL() 
                });
            
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
    },

    createProgressBar(progress) {
        const totalBars = 15;
        const filledBars = Math.floor((progress / 100) * totalBars);
        const emptyBars = totalBars - filledBars;
        
        const progressEmojis = ['🟢', '🟡', '🔵', '🟣', '🔴', '🟠'];
        const randomProgressEmoji = progressEmojis[Math.floor(Math.random() * progressEmojis.length)];
        
        const filled = '█'.repeat(filledBars);
        const empty = '░'.repeat(emptyBars);
        
        return `\`${filled}${randomProgressEmoji}${empty}\` **${progress}%**`;
    }
};
