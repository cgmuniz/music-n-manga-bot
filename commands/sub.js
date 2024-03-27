const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } = require("discord.js");
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
    if (args[0] === "unsub") mangas = await mangasSubs.getSubs(userId)

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

module.exports = { execute }