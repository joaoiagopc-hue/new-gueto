const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config();

const app = express();
app.get('/', (req, res) => res.send('🧱 Central GUETO HELP Ativa!'));
app.listen(process.env.PORT || 3000, () => console.log('📡 Porta ativa para o Render.'));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

function carregarModuloSeguro(caminhoRelativo) {
    const caminho = path.join(__dirname, caminhoRelativo);
    if (fs.existsSync(caminho)) {
        try {
            delete require.cache[require.resolve(caminho)];
            return require(caminho);
        } catch (err) {
            console.error(`❌ Erro ao ler o script local em: ${caminho}`, err);
        }
    }
    return null;
}

client.once('ready', async () => {
    console.log('🧱 [BOT HELP] Central online operando rotas de subpastas completas!');

    const commands = [
        new SlashCommandBuilder().setName('painel-ticket').setDescription('Envia o painel esmero público de suporte da cidade.'),
        new SlashCommandBuilder().setName('top-avaliar').setDescription('Exibe o ranking de avaliação e média da Staff.'),
        new SlashCommandBuilder().setName('painel-armadilha').setDescription('Envia o painel de métricas do sistema Anti-Scam.'),
        new SlashCommandBuilder().setName('cria-embed').setDescription('🔒 Comando Staff: Abre o formulário para criar uma Embed personalizada em parágrafo.'),
        new SlashCommandBuilder().setName('painel-id').setDescription('🔒 Comando Staff: Envia o painel oficial com o botão de solicitar ID/Passaporte.'),
        new SlashCommandBuilder().setName('painel-wl').setDescription('🔒 Comando Staff: Envia o painel oficial com o botão de iniciar o teste de White-List.')
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('🔄 Sincronizando comandos barra com o Discord...');
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log('✅ Todos os comandos barra (/) foram injetados com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao registrar Slash Commands:', error);
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    try {
        const armadilhaModule = carregarModuloSeguro('commands/rp/armadilha.js');
        if (armadilhaModule && typeof armadilhaModule.verificarAmeacasArmadilha === 'function') {
            const interceptouAmeaca = await armadilhaModule.verificarAmeacasArmadilha(message);
            if (interceptouAmeaca) return;
        }
    } catch (e) { }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;
        
        if (commandName === 'painel-ticket') {
            try { const m = carregarModuloSeguro('commands/rp/ticket.js'); if (m) await m.execute(interaction); } catch (e) { console.error(e); }
            return;
        }
        if (commandName === 'top-avaliar') {
            try { const m = carregarModuloSeguro('commands/rp/ticket.js'); if (m) await m.executeRanking(interaction); } catch (e) { console.error(e); }
            return;
        }
        if (commandName === 'painel-armadilha') {
            try { const m = carregarModuloSeguro('commands/rp/armadilha.js'); if (m) await m.executePrefixArmadilha(interaction); } catch (e) { console.error(e); }
            return;
        }
        if (commandName === 'cria-embed') {
            try { const m = carregarModuloSeguro('commands/admin/cria_embed.js'); if (m) { if(m.executeSlashCriaEmbed) await m.executeSlashCriaEmbed(interaction); else await m.execute(interaction); } } catch (e) { console.error(e); }
            return;
        }
        if (commandName === 'painel-id') {
            try { const m = carregarModuloSeguro('commands/rp/passaporte.js'); if (m) await m.execute(interaction); } catch (e) { console.error(e); }
            return;
        }
        if (commandName === 'painel-wl') {
            try { const m = carregarModuloSeguro('commands/rp/wl.js'); if (m) await m.execute(interaction); } catch (e) { console.error(e); }
            return;
        }
    }

    if (interaction.isButton() || interaction.isModalSubmit()) {
        try {
            const ticketModule = carregarModuloSeguro('ticket_botoes.js');
            if (ticketModule) {
                if (typeof ticketModule.handleInteractions === 'function') await ticketModule.handleInteractions(interaction);
                else if (typeof ticketModule.handleInteraction === 'function') await ticketModule.handleInteraction(interaction);
                else if (typeof ticketModule.processarTudo === 'function') await ticketModule.processarTudo(interaction);
            }
        } catch (e) { console.error(e); }

        try {
            const passaporteModule = carregarModuloSeguro('commands/admin/passaporte_botoes.js');
            if (passaporteModule) {
                if (typeof passaporteModule.handleInteractions === 'function') await passaporteModule.handleInteractions(interaction);
                else if (typeof passaporteModule.handleInteraction === 'function') await passaporteModule.handleInteraction(interaction);
                else if (typeof passaporteModule.processarFluxoId === 'function') await passaporteModule.processarFluxoId(interaction);
            }
        } catch (e) { console.error(e); }

        try {
            const wlModule = carregarModuloSeguro('commands/admin/wl_botoes.js');
            if (wlModule) {
                if (typeof wlModule.handleInteractions === 'function') await wlModule.handleInteractions(interaction);
                else if (typeof wlModule.handleInteraction === 'function') await wlModule.handleInteraction(interaction);
                else if (typeof wlModule.processarWLAUTOMATICA === 'function') await wlModule.processarWLAUTOMATICA(interaction);
            }
        } catch (e) { console.error(e); }
    }
});

client.login(process.env.DISCORD_TOKEN);
