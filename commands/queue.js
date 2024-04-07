const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")

const timestampCalc = require("../utils/timestampCalc.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Mostra as 10 primeiras músicas da fila"),

    execute: async ({ client, message, args, serverQueue }) => {
        if (!message.member.voice.channel)
            return message.reply("Você deve estar em call para ver a fila!")
        if (!serverQueue)
            return message.channel.send("Não há músicas na fila!")

        const musicaAtual = serverQueue.songs[0]

        timeAtual = timestampCalc.calcular(serverQueue.currentSec)
        timeMusic = timestampCalc.calcular(musicaAtual.durationSec)

        const musicaAtualmsg = `[${timeAtual}/${timeMusic}] \`${musicaAtual.title}\` - <@${musicaAtual.requestedBy.id}>`

        let queueString

        if (serverQueue.songs[1]) queueString = serverQueue.songs.slice(1, 11).map((song, i) => {
            return `**${i + 1})** ${song.duration} \`${song.title}\` - <@${song.requestedBy.id}>`
        }).join("\n")

        segundosFila = serverQueue.timeSecQueue - serverQueue.songs[0].durationSec

        timeString = timestampCalc.calcular(segundosFila)
        
        let txtMsc = "músicas"
        if(!serverQueue.songs[2]){
            txtMsc = "música"
        }

        embedMessage = new EmbedBuilder()
            .setDescription(`**Tocando nesse momento**\n\n${musicaAtualmsg}` +
                (serverQueue.loop ? `\n*Em looping* :repeat:` : "") +
                (queueString ? `\n\n\n**Fila [${timeString}]** (${serverQueue.songs.length - 1} ${txtMsc})` +
                (serverQueue.loopQueue ? `\n*Queue em looping* :repeat:` : "") +
                `\n\n${queueString}` : "")
            )
            .setThumbnail(musicaAtual.thumbnail)

        message.channel.send({ embeds: [embedMessage] })

    }
}