const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Função que traduz a linguagem .bh
function processarBH(conteudo, msg) {
    // Busca blocos entre {comando ... }
    const blocos = conteudo.match(/\{comando[\s\S]*?\}/g);
    if (!blocos) return;

    for (const bloco of blocos) {
        // Extrai o gatilho do $contains
        const gatilhoMatch = bloco.match(/\$contains\["(.*?)"\]/);
        const gatilho = gatilhoMatch ? gatilhoMatch[1] : null;

        if (gatilho && msg.content.toLowerCase().includes(gatilho.toLowerCase())) {
            // Extrai o texto do $print
            let resposta = bloco.match(/\$print\["(.*?)"\]/)[1];

            // Tradução de variáveis
            resposta = resposta.replace('$username', msg.author.username);
            resposta = resposta.replace('$ping', client.ws.ping);
            resposta = resposta.replace('$authorid', msg.author.id);

            msg.channel.send(resposta);
            break; 
        }
    }
}

client.on('messageCreate', (msg) => {
    if (msg.author.bot) return;
    
    try {
        const script = fs.readFileSync('./commands.bh', 'utf8');
        processarBH(script, msg);
    } catch (err) {
        console.error("Erro ao ler commands.bh:", err);
    }
});

client.login(process.env.TOKEN);
