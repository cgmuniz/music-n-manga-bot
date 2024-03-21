const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js")
const client = new Client(
  {
    intents: [
      GatewayIntentBits.Guilds, 
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ],
  }
)
const config = require("./config.json")

client.once("ready", () => {
  console.log(`Bot iniciado com ${client.users.cache.size} clientes, em ${client.channels.cache.size} canais, em ${client.guilds.cache.size} servidores`)
  client.user.setActivity(`Há ${new Date().getFullYear()} anos sem sexo`)
})

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

client.on("messageCreate", async (message) => {
  if(!message.content.startsWith(config.prefix) || message.author.bot || !message.guild) return

  const commandName = message.content.toLowerCase().split(" ")[0].substring(config.prefix.length)

  if(commandName === "pp") {
    embedMessage = new EmbedBuilder().setTitle("Tamain do pene").setDescription(`Pau do ${message.author.username}:\n8${"=".repeat(randomIntFromInterval(0, 20))}D`).setColor("Random")
    message.channel.send({ embeds: [embedMessage] })
  }
  
});

client.login(config.token)