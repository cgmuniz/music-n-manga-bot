const ytdl = require("ytdl-core");
const yts = require("yt-search");

const tempoVideoMaximoString = "25 minutos"
const tempoVideoMaximoSec = 1500

const fs = require("node:fs")

module.exports = {
    execute: async ({ client, message, args }) => {
        if (!args[0]) return message.reply("Diga qual vídeo deseja!")

        let url
        let title

        if (ytdl.validateURL(args[0])) {
            url = args[0]
        } else {
            const { videos } = await yts(args.join(" "))
            if (!videos.length) return message.reply("Nenhum vídeo encontrado!")

            url = videos[0].url
        }

        const info = await ytdl.getInfo(url)
        title = info.videoDetails.title
        const sec = parseInt(info.videoDetails.lengthSeconds)

        if (sec > tempoVideoMaximoSec) return message.reply(`Vídeo muito longo! (Tempo de vídeo máximo: ${tempoVideoMaximoString})`)

        const videoFormat = sec > 420 ? ytdl.chooseFormat(info.formats, { filter: 'audioandvideo', quality: 'lowest' })
            : ytdl.chooseFormat(info.formats, { filter: 'audioandvideo', quality: 'highest' })
        const videoStream = ytdl.downloadFromInfo(info, { format: videoFormat })
        const videoFilePath = 'video.mp4'

        message.reply("Procurando no YouTube...")
            .then(replyMessage => {
                // Baixar o vídeo e enviar depois que estiver pronto
                videoStream.pipe(fs.createWriteStream(videoFilePath)).on('finish', () => {
                    // Editar a primeira mensagem para responder com a segunda mensagem
                    replyMessage.edit({ content: title, files: [videoFilePath] })
                        .then(() => {
                            fs.unlink(videoFilePath, (error) => {
                                if (error) {
                                    console.error('Erro ao excluir o arquivo:', error);
                                } else {
                                    console.log('Arquivo excluído com sucesso:', videoFilePath);
                                }
                            })
                            console.log('Vídeo enviado com sucesso!')
                        })
                        .catch(async (error) => {
                            replyMessage.edit("Erro ao enviar o vídeo, vídeo muito pesado!")
                            console.error('Erro ao enviar o vídeo:', error);
                            // Verifica se o arquivo existe
                            try {
                                await fs.promises.access(videoFilePath);
                                // Se existir, exclui o arquivo
                                await fs.promises.unlink(videoFilePath);
                                console.log('Arquivo excluído com sucesso:', videoFilePath);
                            } catch (err) {
                                console.error('Erro ao excluir o arquivo:', err);
                            }
                        })
                })
            })
            .catch(console.error)

        return
    },
}

