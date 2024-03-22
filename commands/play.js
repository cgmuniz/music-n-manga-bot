const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { YouTubeExtractor } = require("@discord-player/extractor")


module.exports = {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("Toca uma música do YouTube.")
		.addSubcommand(subcommand =>
			subcommand
				.setName("search")
				.setDescription("Procura uma música e toca ela")
				.addStringOption(option =>
					option.setName("searchterms").setDescription("search keywords").setRequired(true)
				)
		)
        .addSubcommand(subcommand =>
			subcommand
				.setName("playlist")
				.setDescription("Toca uma playlist do YouTube")
				.addStringOption(option => option.setName("url").setDescription("url da playlist").setRequired(true))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("song")
				.setDescription("Toca uma música do YouTube")
				.addStringOption(option => option.setName("url").setDescription("url da música").setRequired(true))
		),
	execute: async ({ client, interaction }) => {

        // Make sure the user is inside a voice channel
		if (!interaction.member.voice.channel) return interaction.reply({content: "Você não está em um canal de voz!", ephemeral: true});

        // Create a play queue for the server
		const queue = await client.player.nodes.create(interaction.guild);

        // Wait until you are connected to the channel
		if (!queue.connection) await queue.connect(interaction.member.voice.channel)

		let embed = new EmbedBuilder()

		if (interaction.options.getSubcommand() === "song") {
            let url = interaction.options.getString("url")
            
            // Search for the song using the discord-player
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: `ext:${YouTubeExtractor.identifier}`
            })

            // finish if no tracks were found
            if (result.tracks.length === 0)
                return interaction.reply({content: "Sem resultados", ephemeral: true})

            // Add the track to the queue
            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
                .setDescription(`**[${song.title}](${song.url})** foi adicionada à fila!`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duração: ${song.duration}`})

		}
        else if (interaction.options.getSubcommand() === "playlist") {

            // Search for the playlist using the discord-player
            let url = interaction.options.getString("url")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: `ext:${YouTubeExtractor.identifier}`
            })

            if (result.tracks.length === 0)
                return interaction.reply({content: `Nenhuma playslist encontrada com ${url}`, ephemeral: true})
            
            // Add the tracks to the queue
            const playlist = result.playlist
            await queue.addTracks(result.tracks)
            embed
                .setDescription(`**${result.tracks.length} músicas de [${playlist.title}](${playlist.url})** foram adicionadas à fila!`)
                .setThumbnail(playlist.thumbnail)

		} 
        else if (interaction.options.getSubcommand() === "search") {

            // Search for the song using the discord-player
            let url = interaction.options.getString("searchterms")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: `ext:${YouTubeExtractor.identifier}`
            })

            // finish if no tracks were found
            if (result.tracks.length === 0)
                return interaction.reply({content: "Sem resultados", ephemeral: true})
            
            // Add the track to the queue
            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
                .setDescription(`**[${song.title}](${song.url})** foi adicionada à fila!`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duração: ${song.duration}`})
		}

        // Play the song
        if (!queue.playing) await queue.play()
        
        // Respond with the embed containing information about the player
        await interaction.reply({
            embeds: [embed]
        })
	},
}