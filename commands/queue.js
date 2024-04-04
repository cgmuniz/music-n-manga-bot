const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")

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

        const musicaAtualmsg = `${musicaAtual.duration} \`${musicaAtual.title}\` - <@${musicaAtual.requestedBy.id}>`

        let queueString

        if (serverQueue.songs[1]) queueString = serverQueue.songs.slice(1, 11).map((song, i) => {
            return `**${i + 1})** ${song.duration} \`${song.title}\` - <@${song.requestedBy.id}>`
        }).join("\n")

        segundosFila = serverQueue.timeSecQueue - serverQueue.songs[0].durationSec

        hours = Math.floor(segundosFila / 3600);
        minutes = Math.floor((segundosFila - (hours * 3600)) / 60);
        seconds = segundosFila - (hours * 3600) - (minutes * 60);
        timeString = hours != 0 ? (hours.toString().padStart(2, '0') + ':') : "" +
            minutes.toString().padStart(2, '0') + ':' +
            seconds.toString().padStart(2, '0');
        
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