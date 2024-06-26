require("dotenv").config()

// const { REST } = require("@discordjs/rest")
// const { Routes } = require("discord-api-types/v9")
const { Player } = require("discord-player")
const { YouTubeExtractor } = require("@discord-player/extractor")

const queue = new Map();

const { createAudioPlayer, AudioPlayerStatus } = require("@discordjs/voice")

const fs = require("node:fs")
const path = require("node:path")

const { Client, GatewayIntentBits } = require("discord.js")
const client = new Client(
  {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates
    ],
  }
)

const config = require("./config.json");

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

client.on("messageCreate", async (message) => {

  if (!message.content.startsWith(config.prefix) || message.author.bot || !message.guild) return

  const commandName = message.content.toLowerCase().split(" ")[0].substring(config.prefix.length)

  const serverQueue = queue.get(message.guild.id);

  canal = message.member.voice.channel;

  const args = message.content.replace(/\s+/g, " ").split(" ").slice(1)

  switch (commandName) {
    case "ajuda":
    case "h":
    case "help": {
      message.channel.send(
        `**Comandos do bot:**\n\
\`\`\`
comandos básicos:\n\
  &help (alias: &h &ajuda): mostra os comandos existentes do bot\n\
  &avatar [@mention]: envia o avatar do usuário\n\n\
mangás:\n\
  &manga (sub/unsub): lista os mangás que você pode se inscrever\n\
  &manga subs: mostra os mangás nos quais você tem inscrição\n\
  &manga list: mostra os mangás disponíveis\n\n\
música:\n\
  &lyrics: exibe a letra de uma música\n\
  &play (alias: &p): procura e toca uma música\n\
  &skip: pula uma música\n\
  &skipto [index]: pula para uma música na fila\n\
  &pause: pausa uma música\n\
  &resume: retoma uma música\n\
  &remove [index]: remove uma posição da fila\n\
  &forward [index]: avança o tempo na track\n\
  &backward [index]: retrocede o tempo na track\n\
  &loop: coloca a música atual em looping\n\
  &loopqueue: coloca a queue em looping\n\
  &shuffle: embaralha a fila de músicas\n\
  &queue (alias: &fila): mostra a fila atual de músicas\n\
  &clear: limpa a queue atual\n\
  &quit (alias: &exit): desconecta o bot da call\n\n\
vídeos:\n\
  &video: procura um vídeo do YouTube, baixa e envia\n\n\
diversos:\n\
  &riso (alias: &hahaha &rir) [@mention]: risos\n\
  &smt (alias: &kys) [@mention]: keep yourself safe\n\
  &pp: tamain do pene\n\
  &poggers: poggers\`\`\``
      )
      return
    }
    case "play":
    case "p": {
      return runCommandServerQueue("play", client, message, args, serverQueue, queue, player)
    }
    case "forward": {
      if(isNaN(args[0])) return message.reply("Para avançar na track: &forward [segundos]")
      if(parseInt(args[0]) < 0)  return message.reply("Insira um valor válido")
      return runCommandServerQueue("fbward", client, message, args, serverQueue)
    }
    case "backward": {
      if(isNaN(args[0])) return message.reply("Para retroceder na track: &backward [segundos]")
      if(parseInt(args[0]) < 0)  return message.reply("Insira um valor válido")
      args[0] = parseInt(args[0] * -1)
      return runCommandServerQueue("fbward", client, message, args, serverQueue)
    }
    case "lyrics": {
      return runCommandServerQueue("lyrics", client, message, args, serverQueue)
    }
    case "video": {
      return runCommand("video", client, message, args)
    }
    case "skip": {
      return runCommandServerQueue("skip", client, message, args, serverQueue, queue, player)
    }
    case "skipto": {
      if(isNaN(args[0])) return message.reply("Para avançar a uma track: &skipto [index]")
      if(parseInt(args[0]) <= 0)  return message.reply("Insira um valor válido")
      return runCommandServerQueue("skip", client, message, args, serverQueue, queue, player, 1)
    }
    case "pause": {
      return runCommandServerQueue("pause", client, message, args, serverQueue)
    }
    case "resume": {
      return runCommandServerQueue("resume", client, message, args, serverQueue)
    }
    case "remove": {
      if(isNaN(args[0])) return message.reply("Para remover uma posição da fila: &remove [posição]\nMúsica atual tem posição 0")
      return runCommandServerQueue("remove", client, message, args, serverQueue, queue, player)
    }
    case "loop": {
      return runCommandServerQueue("loop", client, message, args, serverQueue)
    }
    case "loopqueue": {
      return runCommandServerQueue("loopqueue", client, message, args, serverQueue)
    }
    case "shuffle": {
      return runCommandServerQueue("shuffle", client, message, args, serverQueue)
    }
    case "queue":
    case "fila": {
      return runCommandServerQueue("queue", client, message, args, serverQueue)
    }
    case "clear": {
      return runCommandServerQueue("clear", client, message, args, serverQueue)
    }
    case "stop":
    case "leave":
    case "quit":
    case "exit": {
      return runCommandServerQueue("exit", client, message, args, serverQueue, queue, player)
    }
    case "avatar": {
      return runCommand("avatar", client, message, args)
    }
    case "kys":
    case "smt": {
      return runCommand("kys", client, message, args)
    }
    case "poggers": {
      return runCommand("poggers", client, message, args)
    }
    case "hahaha":
    case "rir":
     case "risos":
    case "riso": {
      return runCommand("risos", client, message, args)
    }
    case "pp": {
      return runCommand("pp", client, message, args)
    }
    case "manga": {
      if (args[0] === "sub" ||
        args[0] === "unsub" ||
        args[0] === "list" ||
        args[0] === "subs")
        return runCommand("sub", client, message, args)

      return message.reply("Quer se inscrever ou cancelar inscrição? `[&manga (sub/unsub)]`" +
        "\nPara ver os mangás nos quais está inscrito: `&manga subs`" +
        "\nPara ver a lista de mangás disponíveis: `&manga list`")
    }
    case "updates": {
      message.channel.send(
        `**Comandos do bot:**\n\
\`\`\`
música:\n\
  &forward: avança o tempo na track\n\
  &backward: retrocede o tempo na track\n\
  &skipto [index]: pula para uma música na fila\`\`\``
      )
      return
    }
  }

});

function runCommand(commandName, client, message, args) {
  try {
    let fileCommand = require(`./commands/${commandName}.js`)
    fileCommand.execute({ client, message, args })
  } catch (error) {
    console.log(error)
  }
}

function runCommandServerQueue(commandName, client, message, args, serverQueue, queue, player, arg) {
  try {
    let fileCommand = require(`./commands/${commandName}.js`)
    fileCommand.execute({ client, message, args, serverQueue, queue, player,arg })
  } catch (error) {
    console.log(error)
  }
}

const mangasSubs = require("./utils/mangasSubs.js")

function calcularTempo(horario) {
  const agora = new Date();
  const options = { timeZone: 'America/Sao_Paulo' };
  const agoraBrasilia = new Date(agora.toLocaleString('en-US', options));
  
  const horarioAlvo = new Date(agoraBrasilia);

  horarioAlvo.setHours(horario.hour, horario.minute, horario.second, 0);

  if (agoraBrasilia > horarioAlvo) {
    horarioAlvo.setDate(horarioAlvo.getDate() + 1);
  }

  const tempoAteProximoHorario = horarioAlvo - agoraBrasilia;
  return tempoAteProximoHorario;
}

function executarAcaoH(horario, acao) {
  const tempoAteProximoHorario = calcularTempo(horario);

  setTimeout(() => {
    setInterval(acao, 24 * 60 * 60 * 1000);
    acao();
  }, tempoAteProximoHorario);
}

const horario1 = { hour: 6, minute: 0, second: 0 }
const horario2 = { hour: 18, minute: 0, second: 0 };

function acao() {
  mangasSubs.notificar(client);
}

executarAcaoH(horario1, acao);
executarAcaoH(horario2, acao);

client.login(process.env.TOKEN)