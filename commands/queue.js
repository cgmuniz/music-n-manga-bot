const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Mostra as 10 primeiras músicas da fila"),

    execute: async ({ client, interaction }) => {
        const queue = client.player.queue(interaction.guildId)

        // check if there are songs in the queue
        if (!queue || !queue.playing)
        {
            await interaction.reply({content: "Não há músicas na fila", ephemeral: true});
            return;
        }

        // Get the first 10 songs in the queue
        const queueString = queue.tracks.slice(0, 10).map((song, i) => {
            return `${i}) [${song.duration}]\` ${song.title} - <@${song.requestedBy.id}>`
        }).join("\n")

        // Get the current song
        const currentSong = queue.current

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`**Tocando nesse momento**\n` + 
                        (currentSong ? `\`[${currentSong.duration}]\` ${currentSong.title} - <@${currentSong.requestedBy.id}>` : "Nenhuma") +
                        `\n\n**Fila**\n${queueString}`
                    )
                    .setThumbnail(currentSong.setThumbnail)
            ]
        })
    }
}