const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("pause")
		.setDescription("Pausa a música atual"),
	execute: async ({ client, message, args, serverQueue }) => {
		if (!message.member.voice.channel)
			return message.reply("Você deve estar em call para pausar a música!")
		if (!serverQueue)
			return message.channel.send("Não há músicas para pausar!")

		if (serverQueue.playing) {
			serverQueue.playing = false
			serverQueue.player.pause()
			return message.channel.send(`Pausada: **${serverQueue.songs[0].title}** ${serverQueue.songs[0].duration}`)
		}
		else{
            return message.reply(`A música já está pausada`)
        }
	},
}