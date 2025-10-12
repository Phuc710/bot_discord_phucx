
module.exports = {
    enabled: true, 
    lavalink: [
      {
        name: "Boo Bot - Primary Node",
        password: "youshallnotpass",
        host: "lavalink.jirayu.net",
        port: 443,
        secure: true
      },
      {
        name: "Boo Bot - Backup Node 1",
        password: "catfein",
        host: "lavalink.alfari.id",
        port: 443,
        secure: true
      },
      {
        name: "Boo Bot - Backup Node 2",
        password: "catfein",
        host: "lava.catfein.com",
        port: 443,
        secure: true
      }
    ]
};

