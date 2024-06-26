const { createAudioResource } = require("@discordjs/voice")

const { stream } = require("play-dl")

module.exports = {
    play: async (song, serverQueue) => {

        const playStream = await stream(song.url)

        if (!stream) return;

        const songStream = await createAudioResource(playStream.stream, { metadata: this, inputType: playStream.type, inlineVolume: true })

        serverQueue.connection.subscribe(serverQueue.player)

        serverQueue.player.play(songStream)

        if (serverQueue.botMessage) {
            await serverQueue.botMessage.delete(10000)
            serverQueue.botMessage = null
        }
        
        serverQueue.playing = true
        serverQueue.textChannel.send(`Tocando: **${song.title}** ${song.duration}`).then(msg => serverQueue.botMessage = msg)
    },
}