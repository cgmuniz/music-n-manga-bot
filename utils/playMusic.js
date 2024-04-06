const { createAudioResource } = require("@discordjs/voice")

const ytdl = require("ytdl-core")

module.exports = {
    play: async (song, serverQueue) => {
        const stream = await ytdl(song.url, { filter: 'audioonly' })

        const songStream = await createAudioResource(stream)

        serverQueue.connection.subscribe(serverQueue.player)

        serverQueue.player.play(songStream)

        if(serverQueue.botMessage) await serverQueue.botMessage.delete(10000)

        if(!serverQueue.loop) serverQueue.textChannel.send(`Tocando: **${song.title}** ${song.duration}`).then(msg => serverQueue.botMessage = msg)
    },
}