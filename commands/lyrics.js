const { EmbedBuilder } = require("discord.js")
const Genius = require("genius-lyrics")
const ClientGenius = new Genius.Client("yIAYj1pRlxwCZZ6s7m_d9_UxVaSuQXjuxl58iv738hssbo9XAs7tva-tk_mhS3ml")

module.exports = {
    execute: async ({ client, message, args, serverQueue }) => {
        let musiga

        if (!args[0]) {
            if (serverQueue) {
                if (serverQueue.songs[0]) {
                    musiga = serverQueue.songs[0].title
                }
            }
            else return message.reply("Diga qual música deseja!")
        }
        else {
            musiga = args.join(" ")
        }

        const searches = await ClientGenius.songs.search(musiga);

        const firstSong = searches[0];

        let lyrics

        try {
            if (firstSong) {
                lyrics = await firstSong.lyrics()
            }
            else {
                return message.reply("Música não encontrada :(")
            }
        } catch (error) {
            console.log(error)
            return message.reply("Houve um erro ao procurar a música :(")
        }

        if (lyrics.length > 4096) {
            embedMessage = new EmbedBuilder().setTitle(firstSong.title).setThumbnail(firstSong.thumbnail)

            message.reply("Esta letra é grande demais!")
            message.channel.send({ content: "Música encontrada:", embeds: [embedMessage] })
        }
        else {
            embedMessage = new EmbedBuilder()
                .setDescription(lyrics)
                .setTitle(firstSong.title)
                .setThumbnail(firstSong.thumbnail)
            message.channel.send({ embeds: [embedMessage] })
        }

        return
    },
}

