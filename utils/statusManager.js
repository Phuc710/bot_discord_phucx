// ✅ StatusManager.js - Enhanced với Voice Status API
const { ActivityType } = require('discord.js');
const axios = require('axios');

const PRESENCE_PREFIX = '🎧';
const CHANNEL_PREFIX = '💫';
const CHANNEL_EMOJI = '🎶';

class StatusManager {
    constructor(client) {
        this.client = client;
        this.isPlaying = false;
        this.activeVoiceStatus = null;
        this.voiceChannelData = new Map(); // Lưu trạng thái gốc của channel
        this.topicRateLimit = {};
    }

    // ⚙️ Hiển thị tổng số server
    async setServerCountStatus(serverCount) {
        if (this.isPlaying) return;
        try {
            await this.client.user.setPresence({
                activities: [{
                    name: ` Music | /help`,
                    type: ActivityType.Listening
                }],
                status: 'online'
            });
            console.log(`[STATUS] ✅ Đặt trạng thái mặc định: 🎧 Music | /help (${serverCount} server)`);
        } catch (error) {
            console.error('[STATUS] ❌ Lỗi khi đặt trạng thái server:', error.message);
        }
    }

    // 🎵 Khi bot đang phát nhạc
    async setMusicStatus(songName, options = {}) {
        const {
            voiceChannel = null,
            presencePrefix = PRESENCE_PREFIX,
            channelPrefix = CHANNEL_PREFIX,
            channelEmoji = { name: CHANNEL_EMOJI }
        } = options;

        try {
            this.isPlaying = true;
            const activityName = `🎶 ${songName}`.slice(0, 128);

            await this.client.user.setPresence({
                activities: [{
                    name: activityName,
                    type: ActivityType.Listening
                }],
                status: 'online'
            });

            // Update voice channel status
            await this.setVoiceChannelStatus(voiceChannel, songName, {
                prefix: channelPrefix,
                emoji: channelEmoji
            });

            console.log(`[STATUS] 🎶 Đang phát: ${songName}`);
        } catch (error) {
            console.error('[STATUS] ❌ Lỗi khi đặt trạng thái nhạc:', error.message);
        }
    }

    // 🧹 Khi dừng nhạc
    async clearMusicStatus() {
        try {
            this.isPlaying = false;
            await this.clearVoiceChannelStatus();
            const serverCount = this.client.guilds.cache.size;
            await this.setServerCountStatus(serverCount);
            console.log('[STATUS] 🧹 Đã xóa trạng thái nghe nhạc, trở về mặc định');
        } catch (error) {
            console.error('[STATUS] ❌ Lỗi khi xóa trạng thái:', error.message);
        }
    }

    // 🎯 Trạng thái tùy chỉnh
    async setCustomStatus(activity, type = 'Listening') {
        if (this.isPlaying) return;
        try {
            await this.client.user.setPresence({
                activities: [{
                    name: activity,
                    type: ActivityType[type] || ActivityType.Listening
                }],
                status: 'online'
            });
            console.log(`[STATUS] ✅ Đặt trạng thái tùy chỉnh: ${activity}`);
        } catch (error) {
            console.error('[STATUS] ❌ Lỗi khi đặt trạng thái tùy chỉnh:', error.message);
        }
    }

    getIsPlaying() {
        return this.isPlaying;
    }

    setIsPlaying(playing) {
        this.isPlaying = playing;
    }

    // 🎸 === CÁC HÀM MỚI: XỬ LÝ VOICE CHANNEL STATUS ===

    /**
     * Đặt trạng thái cho voice channel khi phát nhạc
     * Ưu tiên: Voice Status API > Topic > Tên Channel
     */
    async setVoiceChannelStatus(voiceChannel, trackTitle, options = {}) {
        if (!voiceChannel) return;

        const channel = typeof voiceChannel === 'string'
            ? this.client.channels.cache.get(voiceChannel)
            : voiceChannel;

        if (!channel) return;

        const { prefix = CHANNEL_PREFIX, emoji = { name: CHANNEL_EMOJI } } = options;
        const statusText = `${prefix} ${trackTitle}`.trim().slice(0, 300);

        // Kiểm tra quyền
        const botMember = channel.guild.members.cache.get(this.client.user.id);
        if (!botMember?.permissions.has('ManageChannels')) {
            console.warn(`[STATUS] ⚠️ Bot thiếu quyền MANAGE_CHANNELS trong ${channel.name}`);
            return;
        }

        // Lưu trạng thái gốc nếu chưa có
        if (!this.voiceChannelData.has(channel.id)) {
            this.voiceChannelData.set(channel.id, {
                originalName: channel.name,
                originalTopic: channel.topic ?? null,
                channelId: channel.id
            });
        }

        // Restore channel cũ nếu khác
        if (this.activeVoiceStatus && this.activeVoiceStatus.channelId !== channel.id) {
            await this.clearVoiceChannelStatus();
        }

        this.activeVoiceStatus = {
            channelId: channel.id,
            method: null // Sẽ được set sau khi thành công
        };

        // 1️⃣ Ưu tiên: Voice Status API
        let success = await this.createVoiceStatusAPI(channel, statusText);
        if (success) {
            this.activeVoiceStatus.method = 'api';
            console.log(`[STATUS] 🎤 Voice Status API: ${channel.name}`);
            return;
        }

        // 2️⃣ Fallback: Đổi Topic
        success = await this.createChannelTopic(channel, statusText, emoji);
        if (success) {
            this.activeVoiceStatus.method = 'topic';
            console.log(`[STATUS] 💬 Topic updated: ${channel.name}`);
            return;
        }

        // 3️⃣ Fallback cuối: Đổi tên Channel
        success = await this.createChannelName(channel, trackTitle);
        if (success) {
            this.activeVoiceStatus.method = 'name';
            console.log(`[STATUS] 📝 Channel renamed: ${channel.name}`);
            return;
        }

        console.warn(`[STATUS] ⚠️ Không thể update voice channel status`);
    }

    /**
     * Xóa trạng thái voice channel khi dừng nhạc
     */
    async clearVoiceChannelStatus() {
        if (!this.activeVoiceStatus) return;

        const { channelId, method } = this.activeVoiceStatus;
        const channel = this.client.channels.cache.get(channelId);
        
        if (!channel) {
            this.activeVoiceStatus = null;
            this.voiceChannelData.delete(channelId);
            return;
        }

        try {
            switch (method) {
                case 'api':
                    await this.deleteVoiceStatusAPI(channel);
                    console.log(`[STATUS] 🔁 Voice Status API cleared: ${channel.name}`);
                    break;
                
                case 'topic':
                    await this.deleteChannelTopic(channel);
                    console.log(`[STATUS] 🔁 Topic restored: ${channel.name}`);
                    break;
                
                case 'name':
                    await this.deleteChannelName(channel);
                    console.log(`[STATUS] 🔁 Name restored: ${channel.name}`);
                    break;
            }
        } catch (error) {
            console.error(`[STATUS] ❌ Lỗi khi restore voice channel:`, error.message);
        } finally {
            this.activeVoiceStatus = null;
            this.voiceChannelData.delete(channelId);
        }
    }

    // === PHƯƠNG PHÁP 1: VOICE STATUS API ===
    async createVoiceStatusAPI(channel, statusText) {
        try {
            const endpoint = `https://discord.com/api/v10/channels/${channel.id}/voice-status`;
            
            await axios.put(endpoint, 
                { status: statusText },
                {
                    headers: {
                        'Authorization': `Bot ${this.client.token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                }
            );
            
            return true;
        } catch (error) {
            if (error.response?.status === 404) {
                console.log(`[STATUS] ℹ️ Voice Status API không khả dụng cho server này`);
            } else if (error.response?.status === 50013) {
                console.warn(`[STATUS] ⚠️ Thiếu quyền Voice Status API`);
            } else {
                console.warn(`[STATUS] ⚠️ Voice Status API error:`, error.message);
            }
            return false;
        }
    }

    async deleteVoiceStatusAPI(channel) {
        try {
            const endpoint = `https://discord.com/api/v10/channels/${channel.id}/voice-status`;
            
            await axios.put(endpoint, 
                { status: '' }, // Empty string để xóa
                {
                    headers: {
                        'Authorization': `Bot ${this.client.token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                }
            );
            
            return true;
        } catch (error) {
            return false;
        }
    }

    // === PHƯƠNG PHÁP 2: TOPIC ===
    async createChannelTopic(channel, statusText, emoji) {
        try {
            if (typeof channel.setTopic !== 'function') {
                return false;
            }

            // Rate limit check
            const now = Date.now();
            const lastUpdate = this.topicRateLimit[channel.id] || 0;
            const timeSinceLastUpdate = now - lastUpdate;
            
            if (timeSinceLastUpdate < 300000) { // 5 phút
                console.log(`[STATUS] ⏳ Topic rate limit: chờ ${Math.ceil((300000 - timeSinceLastUpdate) / 1000)}s`);
                return false;
            }

            const emojiStr = emoji?.name || CHANNEL_EMOJI;
            const newTopic = `${emojiStr} ${statusText}`.trim();
            
            if (channel.topic === newTopic) {
                return true; // Đã đúng rồi
            }

            await channel.setTopic(newTopic);
            this.topicRateLimit[channel.id] = now;
            
            return true;
        } catch (error) {
            if (error.code === 50013) {
                console.warn('[STATUS] ⚠️ Thiếu quyền đổi topic');
            } else if (error.code === 429) {
                console.warn('[STATUS] ⚠️ Topic rate limited');
            }
            return false;
        }
    }

    async deleteChannelTopic(channel) {
        try {
            if (typeof channel.setTopic !== 'function') {
                return false;
            }

            const originalData = this.voiceChannelData.get(channel.id);
            if (!originalData) return false;

            await channel.setTopic(originalData.originalTopic ?? null);
            return true;
        } catch (error) {
            console.error('[STATUS] ❌ Lỗi restore topic:', error.message);
            return false;
        }
    }

    // === PHƯƠNG PHÁP 3: TÊN CHANNEL ===
    async createChannelName(channel, trackTitle) {
        try {
            if (typeof channel.setName !== 'function') {
                return false;
            }

            // Rate limit check (name có giới hạn nghiêm ngặt hơn)
            const now = Date.now();
            const lastUpdate = this.topicRateLimit[`name_${channel.id}`] || 0;
            const timeSinceLastUpdate = now - lastUpdate;
            
            if (timeSinceLastUpdate < 600000) { // 10 phút
                console.log(`[STATUS] ⏳ Name rate limit: chờ ${Math.ceil((600000 - timeSinceLastUpdate) / 1000)}s`);
                return false;
            }

            const originalData = this.voiceChannelData.get(channel.id);
            const baseName = originalData?.originalName || channel.name;
            
            // Tạo tên mới với emoji và giới hạn độ dài
            const newName = `🎸 ${trackTitle}`.slice(0, 100);
            
            if (channel.name === newName) {
                return true; // Đã đúng rồi
            }

            await channel.setName(newName);
            this.topicRateLimit[`name_${channel.id}`] = now;
            
            return true;
        } catch (error) {
            if (error.code === 50013) {
                console.warn('[STATUS] ⚠️ Thiếu quyền đổi tên channel');
            } else if (error.code === 429) {
                console.warn('[STATUS] ⚠️ Name rate limited');
            }
            return false;
        }
    }

    async deleteChannelName(channel) {
        try {
            if (typeof channel.setName !== 'function') {
                return false;
            }

            const originalData = this.voiceChannelData.get(channel.id);
            if (!originalData) return false;

            // Chỉ restore nếu tên hiện tại khác với tên gốc
            if (channel.name !== originalData.originalName) {
                await channel.setName(originalData.originalName);
            }
            
            return true;
        } catch (error) {
            console.error('[STATUS] ❌ Lỗi restore name:', error.message);
            return false;
        }
    }

    // === HÀM TƯƠNG THÍCH VỚI CODE CŨ ===
    async applyVoiceChannelStatus(voiceChannel, statusPayload = {}) {
        const text = statusPayload.text || '';
        const emoji = statusPayload.emoji || { name: CHANNEL_EMOJI };
        await this.setVoiceChannelStatus(voiceChannel, text, { prefix: '', emoji });
    }

    async restoreVoiceChannelStatus() {
        await this.clearVoiceChannelStatus();
    }

    // Wrapper functions cho Lavalink/DisTube
    async onTrackStart(player, track, options = {}) {
        const songName = track.info?.title || track.name || 'Unknown Track';
        await this.setMusicStatus(songName, options);
    }

    async onTrackEnd(player, options = {}) {
        if (options.final) {
            await this.clearMusicStatus();
        }
    }
}

module.exports = StatusManager;