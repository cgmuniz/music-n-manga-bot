const { EmbedBuilder } = require('discord.js');

const axios = require('axios');

const mangas = ["a77742b1-befd-49a4-bff5-1ad4e6b0ef7b", "a96676e5-8ae2-425e-b549-7f15dd34a6d8", "296cbc31-af1a-4b5b-a34b-fee2b4cad542", "c52b2ce3-7f95-469c-96b0-479524fb7a1a"]
const url = "https://api.mangadex.org"

const mangadex = "https://mangadex.org/title"

let mangaCapsData
let mangaData

languages = ["pt-br"]

const dataAtual = new Date();
const dataLimite = new Date(dataAtual.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString();
const dataLimiteSemFuso = dataLimite.slice(0, -5);

async function verificarNovoCapitulo(client, manga) {
    try {
        const response = await axios.get(`${url}/manga/${manga}/feed`, { params: { "translatedLanguage[]": languages, "createdAtSince": dataLimiteSemFuso } });

        while (response.status === 503) {
            console.log("O servidor está indisponível. Tentando novamente em 10 minutos...");
            await new Promise(resolve => setTimeout(resolve, 600000));
            response = await axios.get(`${url}/manga/${manga}/feed`, { params: { "translatedLanguage[]": languages, "createdAtSince": dataLimiteSemFuso } });
        }

        if (response.status === 200) {
            mangaCapsData = response.data

            console.log("Informações dos capitulos:", mangaCapsData);
        } else {
            console.error("Falha ao obter informações do mangá.");
        }

        if (mangaCapsData.data[0]) {
            const responseManga = await axios.get(`${url}/manga/${manga}`)
            mangaData = responseManga.data

            console.log("Informações do mangá:", mangaData);

            const capitulo = mangaCapsData.data[0].attributes
            const titulo = mangaData.data.attributes.title.en

            const coverId = mangaData.data.relationships[2].id

            const responseCover = await axios.get(`${url}/cover/${coverId}`)
            const coverData = responseCover.data

            const cover = coverData.data.attributes.fileName

            const usuario = await client.users.fetch('468524804769710101');

            embedMessage = new EmbedBuilder()
                .setTitle(titulo)
                .setURL(`${mangadex}/${manga}`)
                .setThumbnail(`https://mangadex.org/covers/${manga}/${cover}`)
                .setDescription(`Capítulo **${capitulo.chapter}** - **[${capitulo.title}]** foi lançado!`)

            await usuario.send({ embeds: [embedMessage] })
        }
    } catch (error) {
        console.error('Ocorreu um erro ao verificar o novo capítulo:', error);
    }
    return
}

module.exports = {
    execute: async (client) => {
        for (const manga of mangas) {
            await verificarNovoCapitulo(client, manga);
        }
    }
};