const getUserFromMention = require(`../utils/getUserFromMention.js`);

module.exports = {
    execute: async ({ client, message, args }) => {
        if (args[0]) {
            const user = getUserFromMention.execute( client, args[0] )
            if (!user) {
                return
            }

            return message.channel.send({ content: `<@${user.id}>`, files: ['./media/risos.mp4'] })
        }

        return message.channel.send({ files: ['./media/risos.mp4'] })
    },
}

