const { EmbedBuilder } = require('discord.js');

const axios = require('axios');
const fs = require('fs').promises;

const arquivoSubsMangas = './data/mangas.json';

const url = "https://api.mangadex.org"

const mangadex = "https://mangadex.org/title"

let mangaCapsData
let mangaData
let mangas

const dataAtual = new Date();
const dataLimite = new Date(dataAtual.getTime() - (12 * 60 * 60 * 1000)).toISOString();
const dataLimiteSemFuso = dataLimite.slice(0, -5);

async function carregarMangas() {
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

carregarMangas()

async function getSubs(userId) {
    let mangasSubs = []

    for (const mangaKey of Object.keys(mangas)) {

        const manga = mangas[mangaKey];

        if (manga.subs.includes(userId)) {
            mangasSubs.push(manga)
        }
    }
    return mangasSubs
}

async function getUnsubs(userId) {
    let mangasUnsubs = []

    for (const mangaKey of Object.keys(mangas)) {

        const manga = mangas[mangaKey];

        if (!manga.subs.includes(userId)) {
            mangasUnsubs.push(manga)
        }
    }

    return mangasUnsubs
}

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

        return
    }
}

// Função para cancelar a inscrição de um usuário em um mangá específico
async function cancelarInscricaoUsuario(message, userId, manga) {
    if (mangas[manga].subs && mangas[manga].subs.includes(userId)) {
        mangas[manga].subs = mangas[manga].subs.filter(id => id !== userId);
        await salvarInscricoes(mangas);
        return
    }
}

async function notificarCaps(client) {
    for (const mangaKey of Object.keys(mangas)) {

        const manga = mangas[mangaKey];

        const usuariosInscritos = manga.subs

        if (usuariosInscritos.length > 0) {
            const novoCapitulo = await verificarNovoCapitulo(manga.id, manga.language);

            if (novoCapitulo) {
                for (const userId of usuariosInscritos) {
                    const usuario = await client.users.fetch(userId);
                    await usuario.send({ embeds: [novoCapitulo] });
                }
            }
        }
    }
}


async function verificarNovoCapitulo(manga, language) {
    try {
        const response = await axios.get(`${url}/manga/${manga}/feed`, { params: { "translatedLanguage[]": language, "createdAtSince": dataLimiteSemFuso } });

        while (response.status === 503) {
            console.log("O servidor está indisponível. Tentando novamente em 10 minutos...");
            await new Promise(resolve => setTimeout(resolve, 600000));
            response = await axios.get(`${url}/manga/${manga}/feed`, { params: { "translatedLanguage[]": language, "createdAtSince": dataLimiteSemFuso } });
        }

        if (response.status === 200) {
            mangaCapsData = response.data
        } else {
            console.error("Falha ao obter informações do mangá.");
        }

        if (mangaCapsData.data[0]) {
            const responseManga = await axios.get(`${url}/manga/${manga}`, { timeout: 10000 })
            mangaData = responseManga.data

            const capitulo = mangaCapsData.data[0].attributes
            const titulo = mangaData.data.attributes.title.en || mangaData.data.attributes.title["ja-ro"]

            let coverId

            for (const relationship of mangaData.data.relationships) {
                if (relationship.type === 'cover_art') {
                    coverId = relationship.id;
                    break;
                }
            }

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
        console.error(`Ocorreu um erro ao verificar o novo capítulo de ${manga}:`, error);
    }
    return
}

module.exports = {
    notificar: async (client) => {
        await notificarCaps(client)
    },
    sub: async (message, userId, manga) => {
        await inscreverUsuario(message, userId, manga)
    },
    unsub: async (message, userId, manga) => {
        await cancelarInscricaoUsuario(message, userId, manga)
    },
    getSubs: async (userId) => {
        return await getSubs(userId)
    },
    getUnsubs: async (userId) => {
        return await getUnsubs(userId)
    },
    getMangas: () => {
        return mangas
    }
};