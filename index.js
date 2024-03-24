require("dotenv").config()

// const { REST } = require("@discordjs/rest")
// const { Routes } = require("discord-api-types/v9")
const { Player } = require("discord-player")
const { YouTubeExtractor } = require("@discord-player/extractor")

const Genius = require("genius-lyrics")
const ClientGenius = new Genius.Client("yIAYj1pRlxwCZZ6s7m_d9_UxVaSuQXjuxl58iv738hssbo9XAs7tva-tk_mhS3ml")

const ytdl = require("ytdl-core");
const yts = require("yt-search");
const queue = new Map();

const { joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  entersState,
  StreamType,
  AudioPlayerStatus,
  VoiceConnectionStatus
} = require("@discordjs/voice")

const voice = require('@discordjs/voice');

const fs = require("node:fs")
const path = require("node:path")

const { Client, GatewayIntentBits, EmbedBuilder, Collection, VoiceBasedChannel, Permissions, ReactionEmoji, ReactionCollector, ReactionManager } = require("discord.js")
const client = new Client(
  {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates
    ],
  }
)

const config = require("./config.json")

const tempoVideoMaximoString = "1 hora"
const tempoVideoMaximoSec = 3600

/*
// Carregar os comandos
const commands = []
client.commands = new Collection()

const commandsPath = path.join(__dirname, "commands")
const commandsFile = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"))

for (const file of commandsFile) {
  const filePath = path.join(commandsPath, file)
  const command = require(filePath)

  client.commands.set(command.data.name, command)
  commands.push(command.data.toJSON())
}
*/ // Slash Commands

client.player = new Player(client, {
  ytdlOptions: {
    quality: "highestaudio",
    highWaterMark: 1 << 25
  }
})

client.player.extractors.register(YouTubeExtractor);

const player = createAudioPlayer();

client.once("ready", () => {
  /*const guild_ids = client.guilds.cache.map(guild => guild.id)

  const rest = new REST({ version: "9" }).setToken(process.env.TOKEN)
  for (const guildId of guild_ids) {
    rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), {
      body: commands
    })
      .then(() => console.log(`Comandos adicionados a ${guildId}`))
      .catch(console.error)
  }*/ // Slash Commands

  console.log(`Bot iniciado com ${client.users.cache.size} clientes, em ${client.channels.cache.size} canais, em ${client.guilds.cache.size} servidores`)
  client.user.setActivity(`Há ${new Date().getFullYear()} anos sem sexo`)
})

/*

client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute({ client, interaction });
  }
  catch (error) {
    console.error(error);
    await interaction.reply({ content: "Houve um erro ao executar o comando", ephemeral: true });
  }
});*/ // Slash Commands

/*client.on("guildCreate", guild => {
  console.log(`O bot entrou no servidor: ${guild.name} (id: ${guild.id}). População: ${guild.memberCount} membros`)
  client.user.setActivity(`Estou em ${client.guilds.cache.size} servidores`)
})

client.on("guildDelete", guild => {
  console.log(`O bot foi removido do servidor: ${guild.name} (id: ${guild.id}).`)
  client.user.setActivity(`Estou em ${client.guilds.cache.size} servidores`)
});*/

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

client.on('voiceStateUpdate', (oldState, newState) => {
  if (oldState.member.user.bot) return;

  if (newState.channelId === null) console.log('user left channel', oldState.channelId);
  else if (oldState.channelId === null) console.log('user joined channel', newState.channelId);
  else console.log('user moved channels', oldState.channelId, newState.channelId);
});

client.on("messageCreate", async (message) => {

  if (!message.content.startsWith(config.prefix) || message.author.bot || !message.guild) return

  const commandName = message.content.toLowerCase().split(" ")[0].substring(config.prefix.length)

  const serverQueue = queue.get(message.guild.id);

  canal = message.member.voice.channel;

  switch (commandName) {
    case "ajuda":
    case "h":
    case "help": {
      message.channel.send(
        `**Comandos do bot:**\n\
\`\`\`&help ou &ajuda [alias: &h]: mostra os comandos existentes do bot\n\n\
música:
  &play [alias: &p]: procura e toca uma música\n\
  &skip: pula uma música\n\
  &pause: pausa uma música\n\
  &resume: retoma uma música\n\
  &queue ou &fila: mostra a fila atual de músicas\n\
  &stop: para a reprodução de música\n\
  &quit ou &exit: desconecta o bot da call\n\n\
diversos:\n\
  &pp: tamain do pene\n\
  &poggers: poggers\`\`\``
      )
      return
    }
    case "poggers": {
      message.reply(":scream:")
      return
    }
    case "pp": {
      rand = randomIntFromInterval(0, 1000)
      console.log(`count: ${rand}`)
      if (rand === 453) {
        embedMessage = new EmbedBuilder().setTitle("Tamanhao do pene").setDescription(`Pau do ${message.author.username}:\n8${"=".repeat(68)}D`).setColor("Random")
      }
      else {
        embedMessage = new EmbedBuilder().setTitle("Tamain do pene").setDescription(`Pau do ${message.author.username}:\n8${"=".repeat(randomIntFromInterval(0, 20))}D`).setColor("Random")
      }

      message.channel.send({ embeds: [embedMessage] })
      return
    }
    case "lyrics": {
      const args = message.content.split(" ")
      
      if (!args[1]) {
        if (serverQueue) {
          if(serverQueue.songs[0]){
            musiga = serverQueue.songs[0].title
          }
        }
        else return message.reply("Diga qual música deseja!")
      }
      else{
        musiga = args.slice(1).join(" ")
      }

      const searches = await ClientGenius.songs.search(musiga);

      const firstSong = searches[0];

      let lyrics
      
      if(firstSong){
        lyrics = await firstSong.lyrics()
      }
      else {
        return message.reply("Música não encontrada :(")
      }

      embedMessage = new EmbedBuilder().setDescription(lyrics).setTitle(firstSong.title).setThumbnail(firstSong.thumbnail)

      message.channel.send({ embeds: [embedMessage] })
      return
    }
    case "play":
    case "p": {
      execute(message, serverQueue)
      return
    }
    case "skip": {
      skip(message, serverQueue)
      return
    }
    case "pause": {
      pause(message, serverQueue)
      return
    }
    case "resume": {
      resume(message, serverQueue)
      return
    }
    case "queue":
    case "fila": {
      fila(message, serverQueue)
      return
    }
    case "stop": {
      stop(message, serverQueue)
      return
    }
    case "quit":
    case "exit": {
      let connection = voice.getVoiceConnection(message.guild.id);

      if (connection === undefined) {
        await message.reply("Não to na call carai");
        return;
      };

      message.reply(`Chupa meu papau`)

      serverQueue.songs = []

      queue.delete(message.guild.id)
      connection.disconnect();
    }
  }

  /*try{
    joinVoiceChannel({
      channelId: canal.id, // Id canal de voz
      guildId: canal.guild.id, // Id servidor
      adapterCreator: canal.guild.voiceAdapterCreator
    })

    console.log(`Entrou no canal de voz ${canal.name} com sucesso`);

  } catch(e){
    console.error(`Não foi possível entrar em ${canal.name}`, e);
  }*/

});

async function execute(message, serverQueue) {
  canal = message.member.voice.channel
  // const permissions = message.guild.me.permissions
  // if (!permissions.has(Permissions.FLAGS.CONNECT) || !permissions.has(Permissions.FLAGS.SPEAK)) return message.channel.send('Preciso de permissões para conectar e falar!')
  if (!canal) return message.channel.send("Você não está em um canal de voz!")

  const args = message.content.split(" ")

  let song = {}

  if (!args[1]) return message.reply("Diga qual música deseja!")

  if (ytdl.validateURL(args[1])) {
    url = args[1]
    const songInfo = await ytdl.getInfo(url);
    segundos = songInfo.videoDetails.lengthSeconds

    if (segundos > tempoVideoMaximoSec) return message.channel.send(`Vídeo muito longo! (Tempo de vídeo máximo: ${tempoVideoMaximoString}`)

    let minutos = Math.floor(segundos / 60)
    let segundosRestantes = segundos % 60
    song = {
      requestedBy: message.author,
      title: songInfo.videoDetails.title,
      url: url,
      thumbnail: songInfo.videoDetails.thumbnails,
      duration: `(${minutos}:${segundosRestantes})`
    };
  } else {
    const { videos } = await yts(args.slice(1).join(" "))
    if (!videos.length) return message.channel.send("Nenhuma música encontrada!")

    segundos = videos[0].duration.seconds

    if (segundos > tempoVideoMaximoSec) return message.channel.send(`Vídeo muito longo! (Tempo de vídeo máximo: ${tempoVideoMaximoString}`)

    let minutos = Math.floor(segundos / 60)
    let segundosRestantes = segundos % 60

    song = {
      requestedBy: message.author,
      title: videos[0].title,
      url: videos[0].url,
      thumbnail: videos[0].thumbnail,
      duration: `(${minutos}:${segundosRestantes})`
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

    queueConstruct.songs.push(song)

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
          const serverQueue = queue.get(message.guild.id);
          if (serverQueue) {
            serverQueue.songs.shift(); // Remove a música que acabou de tocar
            if (serverQueue.songs.length > 0) {
              // Se ainda houver músicas na fila, toque a próxima
              song = serverQueue.songs[0]
              play(message.guild, song)
            } else {
              serverQueue.player.stop()
              serverQueue.connection.disconnect()
              queue.delete(message.guild.id)
              return;
            }
          } else {
            console.log("Não há fila de reprodução para o servidor");
          }
        }
      });

      play(message.guild, queueConstruct.songs[0])
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      message.channel.send("Houve um erro ao conectar")
      throw err
    }
  } else {
    serverQueue.songs.push(song)
    return message.channel.send(`Adicionada à fila: **${song.title}**`)
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "Você deve estar na call para skippar a música!"
    )
  if (!serverQueue)
    return message.channel.send("Não há músicas para skippar!")


  message.channel.send(`Skippada: **${serverQueue.songs[0].title}**`)
  serverQueue.songs.shift(); // Remove a música que acabou de tocar
  if (serverQueue.songs.length > 0) {
    // Se ainda houver músicas na fila, toque a próxima
    song = serverQueue.songs[0]
    play(message.guild, song)
  } else {
    serverQueue.player.stop()
    serverQueue.connection.disconnect()
    queue.delete(message.guild.id)
    return;
  }

}

function resume(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send("Você deve estar na call para retomar a música!")
  if (!serverQueue)
    return message.channel.send("Não há músicas para retomar!")

  serverQueue.player.unpause()
}

function pause(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send("Você deve estar na call para pausar a música!")
  if (!serverQueue)
    return message.channel.send("Não há músicas para pausar!")
  serverQueue.player.pause()
}

function fila(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send("Você deve estar na call para ver a fila!")
  if (!serverQueue)
    return message.channel.send("Não há músicas na fila!")

  const queueString = serverQueue.songs.slice(0, 10).map((song, i) => {
    return `${i + 1}) ${song.duration} \`${song.title}\` - <@${song.requestedBy.id}>`
  }).join("\n")

  message.channel.send({
    embeds: [
      new EmbedBuilder()
        .setDescription(`**Fila**\n\n${queueString}`
        )
    ]
  })
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send("Você deve estar na call para parar a música!")
  if (!serverQueue)
    return message.channel.send("Não há músicas para parar!")

  serverQueue.songs = []
  serverQueue.player.stop()
}

const play = async (guild, song) => {
  const serverQueue = queue.get(guild.id)

  const stream = await ytdl(song.url, { filter: 'audioonly' })

  const songStream = await createAudioResource(stream)

  serverQueue.connection.subscribe(serverQueue.player)

  serverQueue.player.play(songStream)

  serverQueue.textChannel.send(`Tocando: **${song.title}**`)
}

client.login(process.env.TOKEN)