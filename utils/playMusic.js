const { createAudioResource } = require("@discordjs/voice")

const ytdl = require("ytdl-core")

module.exports = {
    play: async (song, serverQueue) => {
        const stream = await ytdl(song.url, {
            filter: 'audioonly',
            fmt: "mp3",
            highWaterMark: 1 << 62,
            liveBuffer: 1 << 62,
            dlChunkSize: 0, //disabling chunking is recommended in discord bot
            bitrate: 128,
            quality: "lowestaudio",
        })

        const songStream = await createAudioResource(stream)

        serverQueue.connection.subscribe(serverQueue.player)

        serverQueue.player.play(songStream)

        if (serverQueue.botMessage) await serverQueue.botMessage.delete(10000)

        if (!serverQueue.loop) serverQueue.textChannel.send(`Tocando: **${song.title}** ${song.duration}`).then(msg => serverQueue.botMessage = msg)
    },
}