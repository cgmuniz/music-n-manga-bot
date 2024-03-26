const { SlashCommandBuilder } = require("@discordjs/builders")

const voice = require('@discordjs/voice');

const stopMusic = require(`../utils/stopMusic.js`);

module.exports = {
	data: new SlashCommandBuilder()
		.setName("exit")
		.setDescription("Desconecta o bot do canal"),
	execute: async ({ client, message, args, serverQueue, queue, player }) => {

		let connection = voice.getVoiceConnection(message.guild.id)

		if (connection === undefined) {
			await message.reply("Não to na call carai")
			return
		}

		if (serverQueue) {
			stopMusic.execute(message, serverQueue, queue, player)
			message.reply(`Chupa meu paupau`)
		}
		else {
			message.reply(`Não to na call carai`)
		}

		return
	},
}