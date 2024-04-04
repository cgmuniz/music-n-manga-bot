const { SlashCommandBuilder } = require("@discordjs/builders")

const stopMusic = require(`../utils/stopMusic.js`);
const playMusic = require(`../utils/playMusic.js`);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Pula a música atual"),

    execute: async ({ client, message, args, serverQueue, queue, player }) => {

        if (!message.member.voice.channel)
            return message.reply(
                "Você deve estar em call para skippar a música!"
            )
        if (!serverQueue)
            return message.channel.send("Não há músicas para skippar!")

        message.channel.send(`Skippada: **${serverQueue.songs[0].title}** ${serverQueue.songs[0].duration}`)

        if (!serverQueue.loop) {
            if (serverQueue.loopQueue) {
                serverQueue.songs.push(serverQueue.songs[0])
            }
            else {
                serverQueue.timeSecQueue -= serverQueue.songs[0].durationSec
            }
            serverQueue.songs.shift(); // Remove a música que está tocando
        }
        else{
            serverQueue.loop = false
        }

        if (serverQueue.songs.length > 0) {
            // Se ainda houver músicas na fila, toque a próxima
            song = serverQueue.songs[0]
            playMusic.play(song, serverQueue)
        } else {
            stopMusic.execute(message, serverQueue, queue, player)
            return
        }
    },
}