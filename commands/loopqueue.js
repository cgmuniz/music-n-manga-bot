module.exports = {
	execute: async ({ client, message, args, serverQueue }) => {
		if (!message.member.voice.channel)
			return message.reply("Você deve estar em call para loopar a fila!")
		if (!serverQueue)
			return message.channel.send("Não há músicas para loopar!")

		if (!serverQueue.loopQueue) {
			serverQueue.loopQueue = true
			message.channel.send(`Loop ativado para a fila`)
		} else {
			serverQueue.loopQueue = false
			message.channel.send(`Loop da fila desligado`)
		}
	},
}