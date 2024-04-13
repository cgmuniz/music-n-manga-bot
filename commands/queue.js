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
        if (serverQueue.songs.length === 0)
            return message.channel.send("Não há músicas na fila!")

        const musicaAtual = serverQueue.songs[0]

        timeAtual = timestampCalc.calcular(serverQueue.currentSec)
        timeMusic = timestampCalc.calcular(musicaAtual.durationSec)

        const musicaAtualmsg = `[${timeAtual}/${timeMusic}] \`${musicaAtual.title}\` - <@${musicaAtual.requestedBy.id}>`

        let pages = []
        let current = 0

        for (i = 0; i < (serverQueue.songs.length - 1) / 10; i++) {
            let queueString

            if (serverQueue.songs[1]) queueString = serverQueue.songs.slice(1 + (10 * i), 11 + (10 * i)).map((song, j) => {
                return `**${j + 1 + (10 * i)})** ${song.duration} \`${song.title}\` - <@${song.requestedBy.id}>`
            }).join("\n")

            pages.push(queueString)
        }

        const segundosFila = await serverQueue.timeSecQueue - serverQueue.songs[0].durationSec

        const timeString = timestampCalc.calcular(segundosFila)

        let txtMsc = "músicas"
        if (!serverQueue.songs[2]) {
            txtMsc = "música"
        }

        embedMessage = new EmbedBuilder()
            .setDescription(`**Tocando nesse momento**\n\n${musicaAtualmsg}` +
                (serverQueue.loop ? `\n*Em looping* :repeat:` : "") +
                (pages.length > 0 ? `\n\n\n**Fila [${timeString}]** (${serverQueue.songs.length - 1} ${txtMsc})` +
                    (serverQueue.loopQueue ? `\n*Queue em looping* :repeat:` : "") +
                    (pages.length > 1 ? `\n\n- Página ${current + 1}/${pages.length}` : "") +
                    `\n${pages[current]}` : "")
            )
            .setThumbnail(musicaAtual.thumbnail)

        const Msg = await message.channel.send({ embeds: [embedMessage] })

        if (pages.length > 1) {
            await Msg.react('⬅')
            await Msg.react('➡')

            const collectorFilter = (reaction, user) => {
                return (reaction.emoji.name === '⬅' || reaction.emoji.name === '➡') && user.id != client.user.id
            }

            const collector = await Msg.createReactionCollector({ filter: collectorFilter, time: 90_000 })

            collector.on('collect', (reaction) => {
                reaction.users.remove(reaction.users.cache.get(message.author.id))

                if (reaction.emoji.name === '⬅') {
                    current--
                    if (current < 0) current = pages.length - 1
                }
                else if (reaction.emoji.name === '➡') {
                    current++
                    if (current > pages.length - 1) current = 0
                }
                else return

                const updatedEmbedMessage = new EmbedBuilder()
                    .setDescription(`**Tocando nesse momento**\n\n${musicaAtualmsg}` +
                        (serverQueue.loop ? `\n*Em looping* :repeat:` : "") +
                        (pages.length > 0 ? `\n\n\n**Fila [${timeString}]** (${serverQueue.songs.length - 1} ${txtMsc})` +
                            (serverQueue.loopQueue ? `\n*Queue em looping* :repeat:` : "") +
                            (pages.length > 1 ? `\n\n- Página ${current + 1}/${pages.length}` : "") +
                            `\n${pages[current]}` : "")
                    )
                    .setThumbnail(musicaAtual.thumbnail);

                Msg.edit({ embeds: [updatedEmbedMessage] })
            });
        }
    }
}