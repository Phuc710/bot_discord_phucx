const { ActivityType } = require('discord.js');

module.exports = {
  ownerId: '589636439122378763',
  status: {
    rotateDefault: [
      { name: '🎵 /play để phát nhạc', type: ActivityType.Listening },
      { name: '📊 {servers} servers', type: ActivityType.Watching },
      { name: '👥 {members} members', type: ActivityType.Watching },
      { name: '🎶 Music Bot chất lượng cao', type: ActivityType.Listening },
      { name: '🎆 Boo Bot - Phục vụ cộng đồng', type: ActivityType.Playing },
      { name: '🎸 Let the Beat Drop!', type: ActivityType.Listening },
      { name: '✨ /help cho danh sách lệnh', type: ActivityType.Playing },
      { name: '🎉 Sẵn sàng phục vụ!', type: ActivityType.Playing },
    ],
    songStatus: true
  },
  spotifyClientId : "85aab1d51a174aad9eed6d7989f530e6",
  spotifyClientSecret : "b2ad05aa725e434c88776a1be8eab6c2",
}

