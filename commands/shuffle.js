function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        if (j !== 0) {
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    return array;
}

module.exports = {
    execute: async ({ client, message, args, serverQueue }) => {
        if (!message.member.voice.channel)
            return message.reply("Você deve estar em call para dar shuffle!")
        if (!serverQueue)
            return message.channel.send("Não há músicas para para dar shuffle!")

        serverQueue.songs = shuffleArray(serverQueue.songs)

        message.channel.send(`Queue shuffled`)
    },
}