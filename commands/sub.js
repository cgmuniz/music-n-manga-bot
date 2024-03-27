const inscreverUsuario = require(`../utils/mangasSubs.js`);

let mangaId
let userId
let interaction

function enviar() {
    inscreverUsuario.sub(interaction, userId, mangaId)
}

module.exports = {
    execute: async ({ client, message, args }) => {
        
        interaction = message
        userId = message.author.id

        switch (args[0]) {
            case "csm": {
                mangaId = "a77742b1-befd-49a4-bff5-1ad4e6b0ef7b"
                enviar()
                return
            }
            case "komi": {
                mangaId = "a96676e5-8ae2-425e-b549-7f15dd34a6d8"
                enviar()
                return
            }
            case "onk":
            case "oshi": {
                mangaId = "296cbc31-af1a-4b5b-a34b-fee2b4cad542"
                enviar()
                return
            }
            case "jjk": {
                mangaId = "c52b2ce3-7f95-469c-96b0-479524fb7a1a"
                enviar()
                return
            }
            default: {
                message.reply("Mangá não encontrado")
                return
            }
        }
    }
};