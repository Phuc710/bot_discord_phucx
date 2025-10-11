const { ActivityType } = require('discord.js');

module.exports = {
  ownerId: '895512947013611530',
  status: {
    rotateDefault: [
      { name: '🇻🇳 Dành cho Việt Nam', type: ActivityType.Playing },
      { name: '/help để xem lệnh', type: ActivityType.Playing },
      { name: '🎵 {servers} servers', type: ActivityType.Watching },
      { name: '👥 {members} members', type: ActivityType.Watching },
      { name: '🎶 Nhạc chất lượng cao', type: ActivityType.Listening },
      { name: '/setup-central', type: ActivityType.Playing },
    ],
    songStatus: true
  },
  spotifyClientId : "85aab1d51a174aad9eed6d7989f530e6",
  spotifyClientSecret : "b2ad05aa725e434c88776a1be8eab6c2",
}

