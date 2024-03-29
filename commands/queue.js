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

        if (serverQueue.songs[1]) queueString = serverQueue.songs.slice(1, 10).map((song, i) => {
            return `${i + 1}) ${song.duration} \`${song.title}\` - <@${song.requestedBy.id}>`
        }).join("\n")

        embedMessage = new EmbedBuilder()
            .setDescription(`**Tocando nesse momento**\n\n${musicaAtualmsg}` +
                (serverQueue.loop ? `\n*Em looping* :repeat:` : "") +
                (queueString ? `\n\n**Fila**\n\n${queueString}` : "")
            )
            .setThumbnail(musicaAtual.thumbnail)

        message.channel.send({ embeds: [ embedMessage ] })

    }
}