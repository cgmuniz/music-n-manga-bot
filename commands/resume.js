const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Retoma a música atual"),
    execute: async ({ client, message, args, serverQueue }) => {
        if (!message.member.voice.channel)
            return message.reply("Você deve estar em call para retomar a música!")
        if (!serverQueue)
            return message.channel.send("Não há músicas para retomar!")

        serverQueue.player.unpause()
        message.channel.send(`Tocando: **${serverQueue.songs[0].title}** ${serverQueue.songs[0].duration}`)
    },
}