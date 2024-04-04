module.exports = {
    execute: async ({ client, message, args, serverQueue }) => {

        if (!message.member.voice.channel)
            return message.reply(
                "Você deve estar em call para limpar a fila!"
            )
        if (!serverQueue.songs[1])
            return message.channel.send("Não há músicas na fila de espera!")

        message.channel.send(`Fila limpa!`)

        auxSong = serverQueue.songs[0]
        serverQueue.songs = []
        serverQueue.timeSecQueue = auxSong.durationSec

        serverQueue.songs.push(auxSong)
    },
}