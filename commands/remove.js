const stopMusic = require(`../utils/stopMusic.js`);
const playMusic = require(`../utils/playMusic.js`);

module.exports = {
    execute: async ({ client, message, args, serverQueue, queue, player }) => {

        index = args[0]

        if (!message.member.voice.channel)
            return message.reply(
                "Você deve estar em call para remover um item da fila!"
            )
        if (!serverQueue)
            return message.channel.send("Não há músicas para remover!")

        if (!serverQueue.songs[index]) {
            return message.channel.send("Não há música nessa posição!")
        }

        message.channel.send(`A música **${serverQueue.songs[index].title}** foi removida!`)
        
        serverQueue.timeSecQueue -= serverQueue.songs[index].durationSec

        if (index === "0") {
            if (serverQueue.loop) {
                serverQueue.loop = false
            }
            
            serverQueue.songs.shift();
            
            if (serverQueue.songs.length > 0) {
                // Se ainda houver músicas na fila, toque a próxima
                song = serverQueue.songs[0]
                playMusic.play(song, serverQueue)

                if(serverQueue.loopQueue){
                    if(!serverQueue.songs[1]){
                        message.channel.send(`Apenas uma música na queue, desativando loop para a fila de espera...\nLoop ativado para a música atual`)
                        serverQueue.loopQueue = false
                        serverQueue.loop = true
                    }
                }
            } else {
                stopMusic.execute(message, serverQueue, queue, player)
                return
            }
        }
        else {
            serverQueue.songs.splice(index, 1)
        }
    },
}