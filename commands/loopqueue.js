module.exports = {
	execute: async ({ client, message, args, serverQueue }) => {
		if (!message.member.voice.channel)
			return message.reply("Você deve estar em call para loopar a fila!")
		if (!serverQueue)
			return message.channel.send("Não há músicas para loopar!")

		if (!serverQueue.loopQueue) {
            if(!serverQueue.songs[1]){
                if(!serverQueue.loop){
                    serverQueue.loop = true
                    return message.channel.send(`Apenas uma música na fila, loop ativado para a música atual.`)
                }

                return message.channel.send(`Coloque músicas na fila para ativar o loop da queue.`)
            }

			serverQueue.loopQueue = true
			message.channel.send(`Loop ativado para a fila`)
		} else {
			serverQueue.loopQueue = false
			message.channel.send(`Loop da fila desligado`)
		}
	},
}