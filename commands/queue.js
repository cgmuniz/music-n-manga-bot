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

        const queueString = serverQueue.songs.slice(0, 10).map((song, i) => {
            return `${i + 1}) ${song.duration} \`${song.title}\` - <@${song.requestedBy.id}>`
        }).join("\n")

        message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`**Fila**\n\n${queueString}`)
                /*new EmbedBuilder()
                    .setDescription(`**Tocando nesse momento**\n` +
                        (currentSong ? `\`[${currentSong.duration}]\` ${currentSong.title} - <@${currentSong.requestedBy.id}>` : "Nenhuma") +
                        `\n\n**Fila**\n${queueString}`
                    )
                    .setThumbnail(currentSong.setThumbnail)*/
            ]
        })

    }
}