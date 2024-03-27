const { EmbedBuilder } = require('discord.js');

const axios = require('axios');
const fs = require('fs').promises;

const arquivoSubsMangas = './data/subsMangas.json';

const mangas = [
    {id: "a77742b1-befd-49a4-bff5-1ad4e6b0ef7b", title: "Chainsaw Man"},
    {id: "a96676e5-8ae2-425e-b549-7f15dd34a6d8", title: "Komi-san wa Komyushou Desu."},
    {id: "296cbc31-af1a-4b5b-a34b-fee2b4cad542", title: "Oshi no Ko"},
    {id: "c52b2ce3-7f95-469c-96b0-479524fb7a1a", title: "Jujutsu Kaisen"}
]

const url = "https://api.mangadex.org"

const mangadex = "https://mangadex.org/title"

let mangaCapsData
let mangaData

languages = ["pt-br"]

const dataAtual = new Date();
const dataLimite = new Date(dataAtual.getTime() - (24 * 60 * 60 * 1000)).toISOString();
const dataLimiteSemFuso = dataLimite.slice(0, -5);

// Função para carregar as inscrições dos usuários do arquivo JSON
async function carregarInscricoes() {
    try {
        const existeArquivo = await fs.access(arquivoSubsMangas).then(() => true).catch(() => false);
        // Se o arquivo não existir, crie-o e retorne um objeto vazio
        if (!existeArquivo) {
            await fs.writeFile(arquivoSubsMangas, '{}');
            return {};
        }
        // Se o arquivo existir, leia e retorne os dados
        const dados = await fs.readFile(arquivoSubsMangas, { encoding: 'utf8' });
        return JSON.parse(dados);
    } catch (error) {
        // Se ocorrer qualquer erro, lance o erro para tratamento posterior
        throw error;
    }
}

// Função para salvar as inscrições dos usuários no arquivo JSON
async function salvarInscricoes(inscricoes) {
    await fs.writeFile(arquivoSubsMangas, JSON.stringify(inscricoes, null, 4), { encoding: 'utf8' });
}

// Função para inscrever um usuário em um mangá específico
async function inscreverUsuario(message, userId, mangaId) {
    const inscricoes = await carregarInscricoes();
    if (!inscricoes[mangaId]) {
        inscricoes[mangaId] = [];
    }
    if (!inscricoes[mangaId].includes(userId)) {
        inscricoes[mangaId].push(userId);
        await salvarInscricoes(inscricoes);

        message.reply("Sua inscrição para o mangá foi feita")
    }
}

// Função para cancelar a inscrição de um usuário em um mangá específico
async function cancelarInscricaoUsuario(message, userId, mangaId) {
    const inscricoes = await carregarInscricoes();
    if (inscricoes[mangaId] && inscricoes[mangaId].includes(userId)) {
        inscricoes[mangaId] = inscricoes[mangaId].filter(id => id !== userId);
        await salvarInscricoes(inscricoes);
        message.reply("Inscrição cancelada com sucesso")
    }
}

async function notificarCaps(client) {

    const inscricoes = await carregarInscricoes()

    for (const manga of mangas) {
        let usuariosInscritos

        if (inscricoes[manga.id]) usuariosInscritos = inscricoes[manga.id]

        if (usuariosInscritos) {
            const novoCapitulo = await verificarNovoCapitulo(client, manga.id);

            if (novoCapitulo) {
                for (const userId of usuariosInscritos) {
                    const usuario = await client.users.fetch(userId);
                    await usuario.send({ embeds: [novoCapitulo] });
                }
            }
        }
    }
}


async function verificarNovoCapitulo(manga) {
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

            embedMessage = new EmbedBuilder()
                .setTitle(titulo)
                .setURL(`${mangadex}/${manga}`)
                .setThumbnail(`https://mangadex.org/covers/${manga}/${cover}`)
                .setDescription(`Capítulo **${capitulo.chapter}** - **[${capitulo.title}]** foi lançado!`)

            return embedMessage
        }
    } catch (error) {
        console.error('Ocorreu um erro ao verificar o novo capítulo:', error);
    }
    return
    //468524804769710101
}

module.exports = {
    notificar: async (client) => {
        notificarCaps(client)
    },
    sub: (message, userId, mangaId) => {
        inscreverUsuario(message, userId, mangaId)
    },
    unsub: (message, userId, mangaId) => {
        cancelarInscricaoUsuario(message, userId, mangaId)
    }
};