const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const getUserFromMention = require(`../utils/getUserFromMention.js`);

module.exports = {
    execute: async ({ client, message, args }) => {
        if (args[0]) {
            const user = getUserFromMention.execute( client, args[0] )
            if (!user) {
                return message.reply('Por favor mencione corretamente para ver o avatar de alguém')
            }

            embedMessage = new EmbedBuilder()
                .setTitle(user.username)
                .setImage(user.displayAvatarURL({ format: 'png', size: 4096, dynamic: true }))
                .setColor("Random")

            return message.reply({ embeds: [embedMessage] })
        }

        embedMessage = new EmbedBuilder()
            .setTitle(message.author.username)
            .setImage(message.author.avatarURL({ format: 'png', size: 4096, dynamic: true }))
            .setColor("Random")

        return message.reply({ embeds: [embedMessage] })
    },
}
