const { SlashCommandBuilder } = require("@discordjs/builders")

const ytdl = require("ytdl-core");
const yts = require("yt-search");
const { joinVoiceChannel, createAudioResource } = require("@discordjs/voice");

const tempoMusicaMaximoString = "1 hora"
const tempoMusicaMaximoSec = 3600

const stopMusic = require(`../utils/stopMusic.js`);
const playMusic = require(`../utils/playMusic.js`);

module.exports = {
    /*data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Toca uma música do YouTube.")
        .addStringOption(option =>
            option.setName("url ou pesquisa").setRequired(true)
        ),*/
    execute: async ({ client, message, args, serverQueue, queue, player }) => {
        canal = message.member.voice.channel
        // const permissions = message.guild.me.permissions
        // if (!permissions.has(Permissions.FLAGS.CONNECT) || !permissions.has(Permissions.FLAGS.SPEAK)) return message.channel.send('Preciso de permissões para conectar e falar!')
        if (!canal) return message.reply("Você não está em um canal de voz!")

        let song = {}

        if (!args[0]) return message.reply("Diga qual música deseja!")

        if (ytdl.validateURL(args[0])) {
            url = args[0]
            const songInfo = await ytdl.getInfo(url)
            segundos = songInfo.videoDetails.lengthSeconds

            if (segundos > tempoMusicaMaximoSec) return message.reply(`Música muito longa! (Tempo de música máximo: ${tempoMusicaMaximoString})`)
            
            let minutos = Math.floor(segundos / 60)
            let segundosRestantes = segundos % 60

            segundosRestantes = segundosRestantes < 10 ? `0${segundosRestantes}` : segundosRestantes
            
            song = {
                requestedBy: message.author,
                title: songInfo.videoDetails.title,
                url: url,
                thumbnail: songInfo.videoDetails.thumbnails,
                duration: `(${minutos}:${segundosRestantes})`
            };
        } else {
            const { videos } = await yts(args.join(" "))
            if (!videos.length) return message.reply("Nenhuma música encontrada!")

            segundos = videos[0].duration.seconds

            if (segundos > tempoMusicaMaximoSec) return message.reply(`Música muito longa! (Tempo de música máximo: ${tempoMusicaMaximoString})`)

            song = {
                requestedBy: message.author,
                title: videos[0].title,
                url: videos[0].url,
                thumbnail: videos[0].thumbnail,
                duration: `(${videos[0].timestamp})`
            };
        }

        if (!serverQueue) {
            const queueConstruct = {
                textChannel: message.channel,
                voiceChannel: canal,
                connection: null,
                songs: [],
                volume: 5,
                player: null,
                playing: true
            }

            queue.set(message.guild.id, queueConstruct)

            serverQueue = queue.get(message.guild.id)

            serverQueue.songs.push(song)

            try {
                var connection =
                    await joinVoiceChannel({
                        channelId: canal.id, // Id canal de voz
                        guildId: canal.guild.id, // Id servidor
                        adapterCreator: canal.guild.voiceAdapterCreator
                    })
                queueConstruct.connection = connection
                queueConstruct.player = player;

                player.addListener("stateChange", (oldOne, newOne) => {
                    if (oldOne.status == "idle") {

                    }
                    else if (newOne.status == "idle") {
                        console.log("The song finished")
                        if (serverQueue) {
                            serverQueue.songs.shift(); // Remove a música que acabou de tocar
                            if (serverQueue.songs.length > 0) {
                                // Se ainda houver músicas na fila, toque a próxima
                                song = serverQueue.songs[0]
                                playMusic.play(song, serverQueue)
                            } else {
                                stopMusic.execute(message, serverQueue, queue, player)
                                return
                            }
                        } else {
                            console.log("Não há fila de reprodução para o servidor");
                        }
                    }
                })

                playMusic.play(serverQueue.songs[0], serverQueue)
            } catch (err) {
                console.log(err);
                queue.delete(message.guild.id);
                message.channel.send("Houve um erro ao conectar")
                throw err
            }
        } else {
            serverQueue.songs.push(song)
            return message.channel.send(`Adicionada à fila: **${song.title}** ${song.duration}`)
        }

    },
}