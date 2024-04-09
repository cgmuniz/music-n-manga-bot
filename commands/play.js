const { SlashCommandBuilder } = require("@discordjs/builders")

const ytdl = require("ytdl-core");
const yts = require("yt-search");
const ytpl = require('ytpl');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require("@discordjs/voice");

const stopMusic = require(`../utils/stopMusic.js`);
const playMusic = require(`../utils/playMusic.js`);

const timestampCalc = require("../utils/timestampCalc.js")

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

        let timer
        let currentCount

        player.addListener("stateChange", (oldOne, newOne) => {
            if (oldOne.status == "idle") {

            }
            else if (newOne.status == "playing") {
                clearTimeout(timer);
                currentCount = setInterval(() => {
                    if (newOne.status === "playing") {
                        if (serverQueue) {
                            serverQueue.currentSec += 1
                            return
                        }
                    }
                }, 1000)
            }
            else if (newOne.status == "idle") {
                clearInterval(currentCount)
                serverQueue.currentSec = 0

                if (serverQueue) {
                    if(serverQueue.songs.length !== 0){
                        if (!serverQueue.loop) {
                            if (serverQueue.loopQueue) {
                                serverQueue.songs.push(serverQueue.songs[0])
                            }
                            else {
                                serverQueue.timeSecQueue -= serverQueue.songs[0].durationSec
                            }
                            serverQueue.songs.shift(); // Remove a música que acabou de tocar
                        }
                    }

                    if (serverQueue.songs.length > 0) {
                        // Se ainda houver músicas na fila, toque a próxima
                        song = serverQueue.songs[0]
                        playMusic.play(song, serverQueue)
                    } else {
                        message.channel.send("Sem mais músicas na fila")

                        timer = setTimeout(() => {
                            // Se o player ainda estiver em estado "idle" após 3 minutos, parar a música
                            if (newOne.status === "idle") {
                                if (serverQueue) {
                                    message.channel.send("3 minutos sem música, saindo...")
                                    stopMusic.execute(message, serverQueue, queue, player);
                                    return
                                }
                            }
                        }, 3 * 60 * 1000)
                    }
                } else {
                    console.log("Não há fila de reprodução para o servidor");
                }
            }
            else{
                clearInterval(currentCount);
                clearTimeout(timer);
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
        timeSecQueue: 0,
        currentSec: 0,
        botMessage: null
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

        let replyMessage

        await message.channel.send("Procurando...").then(msg => replyMessage = msg)

        if (ytdl.validateURL(args[0])) {
            url = args[0]

            let songInfo
            try {
                songInfo = await ytdl.getInfo(url)
            } catch (error) {
                replyMessage.delete(10000)
                message.reply("Erro ao verificar o vídeo")
            }

            segundos = songInfo.videoDetails.lengthSeconds
            timeString = timestampCalc.calcular(segundos)

            song = {
                requestedBy: message.author,
                title: songInfo.videoDetails.title,
                url: url,
                thumbnail: songInfo.videoDetails.thumbnails[0].url,
                duration: `(${timeString})`,
                durationSec: parseInt(segundos)
            };
        } else if (args[0].includes("www.youtube.com/playlist?list=")) {
            const id = args[0].replace(/^.*=/i, "")

            try {
                playlist = await ytpl(id)
            } catch (error) {
                replyMessage.delete(10000)
                message.reply("Erro ao verificar o vídeo")
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

            serverQueue.botMessage = replyMessage

            await conectar(message, serverQueue, queue, queueConstruct, player, canal)

        } else if (!playlist) {
            serverQueue.songs.push(song)
            serverQueue.timeSecQueue += song.durationSec
            replyMessage.delete(10000)
            if(serverQueue.songs.length === 1) return playMusic.play(serverQueue.songs[0], serverQueue)
            return message.channel.send(`Adicionada à fila: **${song.title}** ${song.duration}`)
        }

    },
}