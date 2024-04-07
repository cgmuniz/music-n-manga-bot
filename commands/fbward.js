const { createAudioResource } = require("@discordjs/voice")

const { stream } = require("play-dl")

module.exports = {
    execute: async ({ client, message, args, serverQueue }) => {
        if (!message.member.voice.channel)
            return message.reply("Você deve estar em call para avançar a música!")
        if (!serverQueue)
            return message.channel.send("Não há músicas na fila!")

        const musicaAtual = serverQueue.songs[0]

        const targetTime = serverQueue.currentSec + parseInt(args[0])
        
        if(targetTime >= musicaAtual.durationSec){
            return("Maior que o tempo de música! Diminua o número de segundos ou dê &skip para a próxima música")
        }
        else if(targetTime <= 0){
            // Recomeçar a música
            targetTime = 0
        }

        serverQueue.currentSec = targetTime
        
        song = serverQueue.songs[0]

        const playStream = await stream(song.url, { seek : targetTime })

        if (!stream) return;

        const songStream = await createAudioResource(playStream.stream, { metadata: this, inputType: playStream.type, inlineVolume: true })

        serverQueue.connection.subscribe(serverQueue.player)

        serverQueue.player.play(songStream)

        message.react("👍")
    }
}