const { EmbedBuilder } = require('discord.js');

const axios = require('axios');
const fs = require('fs').promises;

const arquivoSubsMangas = './data/mangas.json';

const url = "https://api.mangadex.org"

const mangadex = "https://mangadex.org/title"

let mangaCapsData
let mangaData
let mangas

languages = ["pt-br"]

const dataAtual = new Date();
const dataLimite = new Date(dataAtual.getTime() - (24 * 60 * 60 * 1000)).toISOString();
const dataLimiteSemFuso = dataLimite.slice(0, -5);

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
        mangas = JSON.parse(dados)
        return
    } catch (error) {
        // Se ocorrer qualquer erro, lance o erro para tratamento posterior
        throw error;
    }
}

carregarInscricoes()

// Função para salvar as inscrições dos usuários no arquivo JSON
async function salvarInscricoes(inscricoes) {
    await fs.writeFile(arquivoSubsMangas, JSON.stringify(inscricoes, null, 4), { encoding: 'utf8' });
}

// Função para inscrever um usuário em um mangá específico
async function inscreverUsuario(message, userId, manga) {
    if (!mangas[manga].subs) {
        mangas[manga].subs = [];
    }
    if (!mangas[manga].subs.includes(userId)) {
        mangas[manga].subs.push(userId);
        await salvarInscricoes(mangas);

        return message.reply("Sua inscrição para o mangá foi feita!")
    }
}

// Função para cancelar a inscrição de um usuário em um mangá específico
async function cancelarInscricaoUsuario(message, userId, manga) {
    if (mangas[manga].subs && mangas[manga].subs.includes(userId)) {
        mangas[manga].subs = mangas[manga].subs.filter(id => id !== userId);
        await salvarInscricoes(mangas);
        return message.reply("Inscrição cancelada com sucesso!")
    }
}

async function notificarCaps(client) {
    for (const mangaKey of Object.keys(mangas)) {

        const manga = mangas[mangaKey];

        const usuariosInscritos = manga.subs

        if (usuariosInscritos.length > 0) {
            const novoCapitulo = await verificarNovoCapitulo(manga.id);

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
    sub: (message, userId, manga) => {
        inscreverUsuario(message, userId, manga)
    },
    unsub: (message, userId, manga) => {
        cancelarInscricaoUsuario(message, userId, manga)
    }
};