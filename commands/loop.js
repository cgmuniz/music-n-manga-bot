module.exports = {
	execute: async ({ client, message, args, serverQueue }) => {
		if (!message.member.voice.channel)
			return message.reply("Você deve estar em call para loopar a música!")
		if (!serverQueue)
			return message.channel.send("Não há músicas para loopar!")
		
		serverQueue.loop = true
		message.channel.send(`Loop ativado para a música atual: **${serverQueue.songs[0].title}** ${serverQueue.songs[0].duration}`)
	},
}