const { SlashCommandBuilder } = require("@discordjs/builders")

const stopMusic = require(`../utils/stopMusic.js`);
const playMusic = require(`../utils/playMusic.js`);

async function retiraMusica(serverQueue){
    if (serverQueue.loopQueue) {
        serverQueue.songs.push(serverQueue.songs[0])
    }
    else {
        serverQueue.timeSecQueue -= serverQueue.songs[0].durationSec
    }
    serverQueue.songs.shift();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Pula a música atual"),

    execute: async ({ client, message, args, serverQueue, queue, player, arg }) => {

        if (!message.member.voice.channel)
            return message.reply(
                "Você deve estar em call para skippar a música!"
            )
        if (!serverQueue)
            return message.channel.send("Não há músicas para skippar!")

        
        if (!serverQueue.loop) {
            if (arg === 1) {
                index = parseInt(args[0])
                
                if (serverQueue.songs[index]) {
                    for (i = 0; i < index; i++) {
                        retiraMusica(serverQueue)
                    }
                }
                else {
                    return message.channel.send("Não há música nessa posição!")
                }
            }
            else {
                retiraMusica(serverQueue)
            }
        }
        else {
            serverQueue.loop = false
        }

        serverQueue.currentSec = 0

        message.react("👍")
        
        if (serverQueue.songs.length > 0) {
            // Se ainda houver músicas na fila, toque a próxima
            song = serverQueue.songs[0]
            playMusic.play(song, serverQueue)
        } else {
            serverQueue.player.stop()
            return
        }
    },
}