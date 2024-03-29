const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, EmbedBuilder } = require("discord.js");
const mangasSubs = require(`../utils/mangasSubs.js`);

let userId
let interaction

function enviarSubs(value) {
    mangasSubs.sub(interaction, userId, value)
}

function enviarUnsubs(value) {
    mangasSubs.unsub(interaction, userId, value)
}

async function execute({ client, message, args }) {

    interaction = message
    userId = message.author.id

    const messageId = message.id
    let mangas = []

    if (args[0] === "sub") mangas = await mangasSubs.getUnsubs(userId)
    else if (args[0] === "unsub") mangas = await mangasSubs.getSubs(userId)
    else if (args[0] === "list") return await getMangas(message)
    else if(args[0] === "subs") return await getSubs(message)

    if (mangas.length > 0) {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(messageId)
            .setPlaceholder("Selecione um mangá")
            .setMinValues(0)
            .setMaxValues(mangas.length)
            .addOptions(
                mangas.map((manga) =>
                    new StringSelectMenuOptionBuilder()
                        .setLabel(manga.title)
                        .setValue(manga.value)
                )
            )

        const actionRow = new ActionRowBuilder().addComponents(selectMenu)

        const reply = await message.reply({
            content: args[0] === "sub" ? "Deseja se inscrever em quais mangás?" : "Deseja cancelar inscrição em quais mangás?",
            components: [actionRow]
        })

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: (i) => i.user.id === userId && i.customId === messageId,
            time: 60_000
        })

        collector.on("collect", async (interaction) => {
            if (interaction.values.length) {
                const values = interaction.values

                if (args[0] === "sub") {
                    for (const value of values) {
                        enviarSubs(value)
                    }

                    reply.edit({ content: "Inscrições feitas!", components: [] })
                }

                if (args[0] === "unsub") {
                    for (const value of values) {
                        enviarUnsubs(value)
                    }

                    reply.edit({ content: "Inscrições canceladas!", components: [] })
                }
            }
        })

        return
    }
    else {
        if (args[0] === "sub") message.reply("Você já está inscrito em todos os mangás!")
        if (args[0] === "unsub") message.reply("Você não está inscrito em nenhum mangá!")
    }

    return
}

async function getSubs(message) {

    let mangas = []

    mangas = await mangasSubs.getSubs(userId)

    if (mangas.length > 0) {

        mangasString = mangas.map((manga) => {
            return `- *${manga.title}*`
        }).join("\n")

        embedMessage = new EmbedBuilder()
            .setDescription(`**Suas inscrições:**\n\n${mangasString}`)

        message.reply({ embeds: [embedMessage] })

        return
    }
    else {
        message.reply("Você não está inscrito em nenhum mangá!")
    }

    return
}

async function getMangas(message) {

    let mangas = []

    const mangasJson = await mangasSubs.getMangas()

    for (const mangaKey of Object.keys(mangasJson)) {

        const manga = mangasJson[mangaKey];

        mangas.push(manga)
    }

    mangasString = mangas.map((manga) => {
        return `- *${manga.title}*`
    }).join("\n")

    embedMessage = new EmbedBuilder()
        .setDescription(`**Mangás disponíveis:**\n\n${mangasString}`)

    message.channel.send({ embeds: [embedMessage] })

    return
}

module.exports = { execute }