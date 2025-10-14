const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
    getVoiceConnection
} = require('@discordjs/voice');
const { request } = require('undici');

const MAX_TEXT_LENGTH = 200;
const TTS_BASE_URL = 'https://translate.googleapis.com/translate_tts';
const READY_TIMEOUT_MS = 15_000;
const PLAY_TIMEOUT_MS = 5_000;
const IDLE_TIMEOUT_MS = 2_000;

async function fetchTTSStream(text, lang = 'vi') {
    const params = new URLSearchParams({
        client: 'tw-ob',
        tl: lang,
        ie: 'UTF-8',
        q: text,
        ttsspeed: '1'
    });

    const { body, statusCode } = await request(`${TTS_BASE_URL}?${params.toString()}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PhucxBot/1.0)' },
        maxRedirections: 5
    });

    if (statusCode !== 200) {
        body?.resume?.();
        throw new Error(`TTS request failed with status ${statusCode}`);
    }

    return body;
}

module.exports = {
    name: 'gg',
    aliases: ['tts'],
    usage: '!gg <text> [--en]',
    description: 'Gọi Chị GG. Dùng !gg <text>',

    async execute(message, args) {
        const member = message.member;
        const voiceChannel = member?.voice?.channel;

        if (!args || args.length === 0) {
            return message.reply({
                content: '❌ Vui lòng nhập nội dung!\n**Cách dùng:** `!gg <text>`'
            }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        }

        let lang = 'vi';
        let inputText = args.join(' ').trim();

        if (inputText.includes('--en') || inputText.includes('-en')) {
            lang = 'en';
            inputText = inputText.replace(/--en|-en/g, '').trim();
        }

        if (!inputText || inputText.length === 0) {
            return message.reply({ content: '❌ Nội dung không được để trống!' })
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        }

        if (inputText.length > MAX_TEXT_LENGTH) {
            return message.reply({
                content: `❌ Nội dung quá dài! Tối đa ${MAX_TEXT_LENGTH} ký tự. (Hiện tại: ${inputText.length})`
            }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        }

        if (!voiceChannel) {
            return message.reply({ content: '❌ Bạn cần ở trong voice channel!' })
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        }

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions?.has(['Connect', 'Speak'])) {
            return message.reply({ content: '❌ Bot không có quyền vào/nói trong voice channel!' })
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        }

        // Giữ lại connection nếu đã có
        let connection = getVoiceConnection(voiceChannel.guild.id);
        if (!connection || connection.joinConfig.channelId !== voiceChannel.id) {
            if (connection) connection.destroy();
            connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                selfDeaf: true
            });
        }

        const audioPlayer = createAudioPlayer();
        connection.subscribe(audioPlayer);

        try {
            await entersState(connection, VoiceConnectionStatus.Ready, READY_TIMEOUT_MS);

            const ttsStream = await fetchTTSStream(inputText, lang);
            const resource = createAudioResource(ttsStream, { inlineVolume: true });
            resource.volume?.setVolume(1.0);

            audioPlayer.play(resource);
            await entersState(audioPlayer, AudioPlayerStatus.Playing, PLAY_TIMEOUT_MS);

            // Đợi khi phát xong
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Playback timeout')), 60000);
                audioPlayer.once(AudioPlayerStatus.Idle, () => {
                    clearTimeout(timeout);
                    setTimeout(resolve, IDLE_TIMEOUT_MS);
                });
                audioPlayer.once('error', err => {
                    clearTimeout(timeout);
                    reject(err);
                });
            });

            await message.react('✅').catch(() => {});
        } catch (error) {
            console.error('[TTS Error]', error);
            await message.react('❌').catch(() => {});
        }

        // Bot chỉ rời khi không còn người trong voice
        const checkEmpty = setInterval(() => {
            const vc = message.guild.channels.cache.get(voiceChannel.id);
            if (!vc || vc.members.filter(m => !m.user.bot).size === 0) {
                clearInterval(checkEmpty);
                const conn = getVoiceConnection(voiceChannel.guild.id);
                if (conn) conn.destroy();
            }
        }, 10000);
    }
};
