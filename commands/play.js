const { SlashCommandBuilder } = require("@discordjs/builders")

const ytdl = require("ytdl-core");
const yts = require("yt-search");
const ytpl = require('ytpl');
const { joinVoiceChannel, VoiceConnectionStatus } = require("@discordjs/voice");

const stopMusic = require(`../utils/stopMusic.js`);
const playMusic = require(`../utils/playMusic.js`);

async function conectar(message, serverQueue, queue, queueConstruct, player, canal) {
    try {
        var connection =
            await joinVoiceChannel({
                channelId: canal.id, // Id canal de voz
                guildId: canal.guild.id, // Id servidor
                adapterCreator: canal.guild.voiceAdapterCreator
            })
        connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
                // Seems to be reconnecting to a new channel - ignore disconnect
            } catch (error) {
                // Seems to be a real disconnect which SHOULDN'T be recovered from
                if (serverQueue) {
                    stopMusic.execute(message, serverQueue, queue, player)
                }
                connection.destroy();
            }
        })

        queueConstruct.connection = connection
        queueConstruct.player = player;

        player.addListener("stateChange", (oldOne, newOne) => {
            if (oldOne.status == "idle") {

            }
            else if (newOne.status == "idle") {
                if (serverQueue) {
                    if (!serverQueue.loop) {
                        if (serverQueue.loopQueue) {
                            serverQueue.songs.push(serverQueue.songs[0])
                        }
                        else {
                            serverQueue.timeSecQueue -= serverQueue.songs[0].durationSec
                        }
                        serverQueue.songs.shift(); // Remove a música que acabou de tocar
                    }
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
}

async function getQueueConstruct(message, canal) {
    const queueConstruct = {
        textChannel: message.channel,
        voiceChannel: canal,
        connection: null,
        songs: [],
        volume: 5,
        player: null,
        playing: true,
        loop: false,
        loopQueue: false,
        timeSecQueue: 0
    }

    return queueConstruct
}

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
        let playlist

        if (!args[0]) return message.reply("Diga qual música deseja!")

        if (ytdl.validateURL(args[0])) {
            url = args[0]

            let songInfo
            try {
                info = await ytdl.getInfo(url)
            } catch (error) {
                message.reply("Erro ao verificar o vídeo")
            }

            segundos = songInfo.videoDetails.lengthSeconds

            let minutos = Math.floor(segundos / 60)
            let segundosRestantes = segundos % 60

            segundosRestantes = segundosRestantes < 10 ? `0${segundosRestantes}` : segundosRestantes

            song = {
                requestedBy: message.author,
                title: songInfo.videoDetails.title,
                url: url,
                thumbnail: songInfo.videoDetails.thumbnails,
                duration: `(${minutos}:${segundosRestantes})`,
                durationSec: segundos
            };
        } else if (args[0].includes("www.youtube.com/playlist?list=")) {
            const id = args[0].replace(/^.*=/i, "")

            try {
                playlist = await ytpl(id)
            } catch (error) {
                console.log(error)
            }

            if (playlist) {
                let queueConstruct

                let connect = false

                let contMus = 0

                if (!serverQueue) {
                    connect = true

                    queueConstruct = await getQueueConstruct(message, canal)

                    queue.set(message.guild.id, queueConstruct)

                    serverQueue = queue.get(message.guild.id)
                }

                for (const songpl of playlist.items) {

                    contMus++

                    song = {
                        requestedBy: message.author,
                        title: songpl.title,
                        url: songpl.url,
                        thumbnail: songpl.bestThumbnail.url,
                        duration: `(${songpl.duration})`,
                        durationSec: songpl.durationSec
                    }

                    serverQueue.songs.push(song)
                    serverQueue.timeSecQueue += song.durationSec

                }

                if (connect) await conectar(message, serverQueue, queue, queueConstruct, player, canal)

                message.channel.send(`${contMus} músicas adicionadas!`)
            }
        } else {
            const { videos } = await yts(args.join(" "))
            if (!videos.length) return message.reply("Nenhuma música encontrada!")

            song = {
                requestedBy: message.author,
                title: videos[0].title,
                url: videos[0].url,
                thumbnail: videos[0].thumbnail,
                duration: `(${videos[0].timestamp})`,
                durationSec: videos[0].seconds
            };
        }

        if (!serverQueue) {
            let queueConstruct

            queueConstruct = await getQueueConstruct(message, canal)

            queue.set(message.guild.id, queueConstruct)

            serverQueue = queue.get(message.guild.id)

            serverQueue.songs.push(song)

            serverQueue.timeSecQueue += song.durationSec

            await conectar(message, serverQueue, queue, queueConstruct, player, canal)

        } else if (!playlist) {
            serverQueue.songs.push(song)
            serverQueue.timeSecQueue += song.durationSec
            return message.channel.send(`Adicionada à fila: **${song.title}** ${song.duration}`)
        }

    },
}