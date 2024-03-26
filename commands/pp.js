const { EmbedBuilder } = require("discord.js");
const randomIntFromInterval = require(`../utils/randomIntFromInterval.js`);

module.exports = {
    execute: async ({ client, message, args }) => {
        rand = randomIntFromInterval.execute(0, 1000)
        if (rand === 453) {
            embedMessage = new EmbedBuilder()
                .setTitle("Tamanhao do pene")
                .setDescription(`Pau do ${message.author.username}:\n8${"=".repeat(68)}D`)
                .setColor("Random")
        }
        else {
            embedMessage = new EmbedBuilder()
                .setTitle("Tamain do pene")
                .setDescription(`Pau do ${message.author.username}:\n8${"=".repeat(randomIntFromInterval.execute(0, 20))}D`)
                .setColor("Random")
        }

        message.channel.send({ embeds: [embedMessage] })
        return
    },
}
