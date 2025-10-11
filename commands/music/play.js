const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const musicIcons = require('../../UI/icons/musicicons');
const SpotifyWebApi = require('spotify-web-api-node');
const { getData } = require('spotify-url-info')(fetch);
const config = require('../../config.js');

const spotifyApi = new SpotifyWebApi({
    clientId: config.spotifyClientId,
    clientSecret: config.spotifyClientSecret,
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Phát nhạc hoặc playlist trong voice channel')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Nhập tên bài hát hoặc URL')
                .setRequired(true)),

    async execute(interaction) {
        try {
            await interaction.deferReply();
            const query = interaction.options.getString('query');
            const user = interaction.user;
            const member = interaction.member;
            const { channel } = member.voice;
            const client = interaction.client;
            const guildId = interaction.guild.id;

            // Kiểm tra voice channel
            if (!channel) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ Bạn phải ở trong voice channel để sử dụng lệnh này.');
                
                const reply = await interaction.editReply({ embeds: [errorEmbed] });
                setTimeout(() => reply.delete().catch(() => {}), 3000);
                return;
            }

            const botVoiceChannel = interaction.guild.members.me?.voice.channel;
            
            if (botVoiceChannel && botVoiceChannel.id !== channel.id) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ Bot đang phát nhạc ở voice channel khác.');
                
                const reply = await interaction.editReply({ embeds: [errorEmbed] });
                setTimeout(() => reply.delete().catch(() => {}), 3000);
                return;
            }
            
            // Kiểm tra quyền
            const permissions = channel.permissionsFor(client.user);
            if (!permissions.has(PermissionFlagsBits.Connect) || !permissions.has(PermissionFlagsBits.Speak)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ Bot cần quyền kết nối và nói trong voice channel.');
                
                const reply = await interaction.editReply({ embeds: [errorEmbed] });
                setTimeout(() => reply.delete().catch(() => {}), 3000);
                return;
            }

            // Lấy hoặc tạo player
            let player = client.riffy.players.get(guildId);
            
            if (!player) {
                try {
                    player = await client.riffy.createConnection({
                        guildId,
                        voiceChannel: channel.id,
                        textChannel: interaction.channel.id,
                        deaf: true
                    });
                } catch (error) {
                    console.error('Error creating player:', error);
                    await interaction.editReply({ content: '❌ Không thể kết nối đến voice channel.' });
                    return;
                }
            }

            // Xử lý Spotify links
            if (query.includes('spotify.com')) {
                try {
                    const spotifyData = await getData(query);
                    const token = await spotifyApi.clientCredentialsGrant();
                    spotifyApi.setAccessToken(token.body.access_token);
            
                    let trackList = [];
            
                    if (spotifyData.type === 'track') {
                        const searchQuery = `${spotifyData.name} - ${spotifyData.artists.map(a => a.name).join(', ')}`;
                        trackList.push(searchQuery);
                    } else if (spotifyData.type === 'playlist') {
                        const playlistId = query.split('/playlist/')[1].split('?')[0];
                        let offset = 0;
                        const limit = 100;
                        let fetched = [];
            
                        do {
                            const data = await spotifyApi.getPlaylistTracks(playlistId, { limit, offset });
                            fetched = data.body.items.filter(item => item.track).map(item =>
                                `${item.track.name} - ${item.track.artists.map(a => a.name).join(', ')}`
                            );
                            trackList.push(...fetched);
                            offset += limit;
                        } while (fetched.length === limit);
                    }

                    if (trackList.length === 0) {
                        await interaction.editReply({ 
                            content: "❌ Không tìm thấy track nào trong Spotify link này." 
                        });
                        return;
                    }
            
                    let added = 0;
                    for (const trackQuery of trackList) {
                        const result = await client.riffy.resolve({ query: trackQuery, requester: user });
                        if (result && result.tracks && result.tracks.length > 0) {
                            const resolvedTrack = result.tracks[0];
                            resolvedTrack.requester = {
                                id: user.id,
                                username: user.username,
                                avatarURL: user.displayAvatarURL()
                            };
                            player.queue.add(resolvedTrack);
                            added++;
                        }
                    }
            
                    const embed = new EmbedBuilder()
                        .setColor('#1DB954')
                        .setTitle(`🎵 Spotify ${spotifyData.type === 'track' ? 'Track' : 'Playlist'} Đã Thêm`)
                        .setDescription(`✅ Đã thêm ${added} track(s) từ Spotify vào hàng đợi.`)
                        .setFooter({ text: `Yêu cầu bởi: ${user.username}`, iconURL: user.displayAvatarURL() });
            
                    const reply = await interaction.editReply({ embeds: [embed] });
                    setTimeout(() => reply.delete().catch(() => {}), 3000);
            
                    if (!player.playing && !player.paused) player.play();
                } catch (spotifyError) {
                    console.error('Spotify error:', spotifyError);
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Lỗi Spotify')
                        .setDescription('Không thể xử lý Spotify link. Vui lòng kiểm tra thông tin Spotify hoặc thử link khác.')
                        .setFooter({ text: 'All In One Music', iconURL: musicIcons.alertIcon });
                    
                    const reply = await interaction.editReply({ embeds: [errorEmbed] });
                    setTimeout(() => reply.delete().catch(() => {}), 5000);
                    return;
                }
            }  
            // Xử lý YouTube links
            else if (query.includes('youtube.com') || query.includes('youtu.be')) {
                let isPlaylist = query.includes('list=');
                let isMix = query.includes('list=RD');
        
                if (isMix) {
                    const mixEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Nội Dung Không Hỗ Trợ')
                        .setDescription('YouTube mixes hiện tại không được hỗ trợ.\nVui lòng sử dụng track hoặc playlist khác.')
                        .setFooter({ text: 'All In One Music', iconURL: musicIcons.alertIcon });
                
                    const reply = await interaction.editReply({ embeds: [mixEmbed] });
                    setTimeout(() => reply.delete().catch(() => {}), 3000);
                    return;
                }
                
                const resolve = await client.riffy.resolve({ query, requester: user });
                if (!resolve || !resolve.tracks || resolve.tracks.length === 0) {
                    const noResultsEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Không Tìm Thấy Kết Quả')
                        .setDescription('Không thể tìm thấy track nào phù hợp với truy vấn của bạn.\nThử sửa đổi tìm kiếm.')
                        .setFooter({ text: 'All In One Music', iconURL: musicIcons.alertIcon });
                
                    const reply = await interaction.editReply({ embeds: [noResultsEmbed] });
                    setTimeout(() => reply.delete().catch(() => {}), 3000);
                    return;
                }
                
                if (isPlaylist) {
                    for (const track of resolve.tracks) {
                        track.requester = {
                            id: user.id,
                            username: user.username,
                            avatarURL: user.displayAvatarURL()
                        };
                        player.queue.add(track);
                    }
        
                    const embed = new EmbedBuilder()
                        .setColor('#DC92FF')
                        .setAuthor({ name: 'Playlist Đã Thêm', iconURL: musicIcons.correctIcon })
                        .setFooter({ text: `Yêu cầu bởi: ${user.username}`, iconURL: user.displayAvatarURL() })
                        .setDescription(`✅ Đã thêm **PlayList** tracks vào hàng đợi.`);
        
                    const reply = await interaction.editReply({ embeds: [embed] });
                    setTimeout(() => reply.delete().catch(() => {}), 3000);
                } else {
                    const track = resolve.tracks[0];
                    track.requester = {
                        id: user.id,
                        username: user.username,
                        avatarURL: user.displayAvatarURL()
                    };
                    player.queue.add(track);
        
                    const embed = new EmbedBuilder()
                        .setColor('#DC92FF')
                        .setAuthor({ name: 'Track Đã Thêm', iconURL: musicIcons.correctIcon })
                        .setFooter({ text: `Yêu cầu bởi: ${user.username}`, iconURL: user.displayAvatarURL() })
                        .setDescription(`🎵 Đã thêm **${track.info.title}** vào hàng đợi.`);
        
                    const reply = await interaction.editReply({ embeds: [embed] });
                    setTimeout(() => reply.delete().catch(() => {}), 3000);
                }
        
                if (!player.playing && !player.paused) player.play();
            }
            // Xử lý tìm kiếm thông thường
            else {
                const resolve = await client.riffy.resolve({ query, requester: user });
                
                if (!resolve || !resolve.tracks || resolve.tracks.length === 0) {
                    const noResultsEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Không Tìm Thấy Kết Quả')
                        .setDescription('Không thể tìm thấy track nào phù hợp với truy vấn của bạn.\nThử sửa đổi tìm kiếm.')
                        .setFooter({ text: 'All In One Music', iconURL: musicIcons.alertIcon });
                
                    const reply = await interaction.editReply({ embeds: [noResultsEmbed] });
                    setTimeout(() => reply.delete().catch(() => {}), 3000);
                    return;
                }

                const track = resolve.tracks[0];
                track.requester = {
                    id: user.id,
                    username: user.username,
                    avatarURL: user.displayAvatarURL()
                };
                player.queue.add(track);

                const embed = new EmbedBuilder()
                    .setColor('#DC92FF')
                    .setAuthor({ name: 'Track Đã Thêm', iconURL: musicIcons.correctIcon })
                    .setFooter({ text: `Yêu cầu bởi: ${user.username}`, iconURL: user.displayAvatarURL() })
                    .setDescription(`🎵 Đã thêm **${track.info.title}** vào hàng đợi.`);

                const reply = await interaction.editReply({ embeds: [embed] });
                setTimeout(() => reply.delete().catch(() => {}), 3000);

                if (!player.playing && !player.paused) player.play();
            }
        } catch (error) {
            console.error('Error resolving query:', error);
        
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Đã Xảy Ra Lỗi')
                .setDescription('Có gì đó sai khi xử lý yêu cầu của bạn.\n\n**Mẹo:**\n- Thử thay đổi Lavalink trong config.\n- Kiểm tra URL track/playlist.')
                .setFooter({ text: 'All In One Music', iconURL: musicIcons.alertIcon })
                .setTimestamp();
        
            const reply = await interaction.editReply({ embeds: [errorEmbed] });
        
            setTimeout(() => {
                reply.delete().catch(() => {});
            }, 6000);
        }
    }
};
