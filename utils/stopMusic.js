const voice = require('@discordjs/voice');

module.exports = {
    execute: (message, serverQueue, queue, player) => {
        serverQueue.player.stop()
        serverQueue.songs = []

        let connection = voice.getVoiceConnection(message.guild.id)
        connection.disconnect()

        queue.delete(message.guild.id)
        player.removeAllListeners()
    },
}