const mangasSubs = require(`../utils/mangasSubs.js`);

let userId
let interaction

function enviar(args) {
    mangasSubs.sub(interaction, userId, args[1])
}

async function execute({ client, message, args }) {
    
    interaction = message
    userId = message.author.id

    switch (args[1]) {
        case "csm":
        case "komi":
        case "onk":
        case "jjk": {
            enviar(args)
            return
        }
        default: {
            message.reply("Mangá não encontrado")
            return
        }
    }
}

module.exports = { execute }