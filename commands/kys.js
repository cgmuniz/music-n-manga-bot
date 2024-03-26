const getUserFromMention = require(`../utils/getUserFromMention.js`);
const randomIntFromInterval = require(`../utils/randomIntFromInterval.js`);

module.exports = {
    execute: async ({ client, message, args }) => {
        if (args[0]) {
            const user = getUserFromMention.execute( client, args[0] )
            if (!user) {
                return
            }

            message.channel.send(`<@${user.id}>`)

            rand = randomIntFromInterval.execute(0, 1)
            rand === 0 ? message.channel.send(`https://tenor.com/view/lightning-black-guy-lightning-you-should-kill-your-self-you-should-treat-your-self-gif-24988025`)
                : message.channel.send(`https://i.kym-cdn.com/photos/images/original/002/229/998/1f4`)

            return
        }

        rand = randomIntFromInterval.execute(0, 1)
        rand === 0 ? message.channel.send("https://tenor.com/view/lightning-black-guy-lightning-you-should-kill-your-self-you-should-treat-your-self-gif-24988025")
            : message.channel.send("https://i.kym-cdn.com/photos/images/original/002/229/998/1f4")
        return
    },
}
