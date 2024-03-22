require("dotenv").config()

const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const { Player } = require("discord-player")
const { YouTubeExtractor } = require("@discord-player/extractor")

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

const { Client, GatewayIntentBits, EmbedBuilder, Collection, VoiceBasedChannel, Permissions } = require("discord.js")
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

client.player = new Player(client, {
  ytdlOptions: {
    quality: "highestaudio",
    highWaterMark: 1 << 25
  }
})

client.player.extractors.register(YouTubeExtractor);

const player = createAudioPlayer();

client.once("ready", () => {
  const guild_ids = client.guilds.cache.map(guild => guild.id)

  const rest = new REST({ version: "9" }).setToken(process.env.TOKEN)
  for (const guildId of guild_ids) {
    rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), {
      body: commands
    })
      .then(() => console.log(`Comandos adicionados a ${guildId}`))
      .catch(console.error)
  }

  console.log(`Bot iniciado com ${client.users.cache.size} clientes, em ${client.channels.cache.size} canais, em ${client.guilds.cache.size} servidores`)
  client.user.setActivity(`Há ${new Date().getFullYear()} anos sem sexo`)
})

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
});

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

  if (commandName === "pp") {
    embedMessage = new EmbedBuilder().setTitle("Tamain do pene").setDescription(`Pau do ${message.author.username}:\n8${"=".repeat(randomIntFromInterval(0, 20))}D`).setColor("Random")
    message.channel.send({ embeds: [embedMessage] })
  }

  const serverQueue = queue.get(message.guild.id);

  canal = message.member.voice.channel;

  switch (commandName) {
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

      queue.delete(message.guild.id)
      connection.destroy();
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

  if (!args.length) return message.channel.send("Diga qual música deseja!")

  if (ytdl.validateURL(args[1])) {
    url = args[1]
    const songInfo = await ytdl.getInfo(url);
    song = {
      title: songInfo.videoDetails.title,
      url: url
    };
  } else {
    const { videos } = await yts(args.slice(1).join(" "));
    if (!videos.length) return message.channel.send("Nenhuma música encontrada!");
    song = {
      title: videos[0].title,
      url: videos[0].url
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
        if(oldOne == "idle"){
      
        }
        else if (newOne.status == "idle") {
          console.log("The song finished")
          const serverQueue = queue.get(message.guild.id);
          if (serverQueue) {
            serverQueue.songs.shift(); // Remove a música que acabou de tocar
            if (serverQueue.songs.length > 0) {
              // Se ainda houver músicas na fila, toque a próxima
              song = serverQueue.songs[0]
              play(message.guild, song);
            } else {
              serverQueue.player.stop();
              serverQueue.connection.destroy()
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
    return message.channel.send(`**${song.title}** foi adicionada à fila!`)
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "Você deve estar na call para skippar a música!"
    )
  if (!serverQueue)
    return message.channel.send("Não há música para skippar!")
  serverQueue.connection.dispatcher.end()
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send("Você deve estar na call para parar a música!")
  serverQueue.songs = []
  serverQueue.connection.dispatcher.end()
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