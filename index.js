const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config();

// 1. SERVIDOR WEB (Para manter online)
const app = express();
app.get('/', (req, res) => res.send('🚀 Bot do Gueto RP Azul Online!'));
app.listen(3000, () => console.log('📡 Servidor Web ativo.'));

// 2. INICIALIZAÇÃO DO BOT
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', async () => {
    console.log(`🔥 ${client.user.tag} está pronto para o Gueto RP Azul!`);
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });
        console.log('🎉 Cache de comandos de barra limpo com sucesso.');
    } catch (error) {
        console.error(error);
    }
});

// 3. GERENCIADOR DE BOTÕES E INTERAÇÕES
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton() && !interaction.isModalSubmit() && !interaction.isStringSelectMenu()) return;
    try {
        if (interaction.customId.includes('id') || interaction.customId.includes('solicitar')) {
            await require('./commands/admin/passaporte_botoes.js').handleInteraction(interaction);
        }
        if (interaction.customId.includes('wl') || interaction.customId.includes('whitelist') || interaction.customId.startsWith('aprovar_wl_') || interaction.customId.startsWith('reprovar_wl_')) {
            await require('./commands/admin/wl_botoes.js').handleInteraction(interaction);
        }
        if (interaction.customId.includes('ticket') || interaction.customId.includes('fechamento') || interaction.customId.includes('motivo')) {
            await require('./commands/admin/ticket_botoes.js').handleInteraction(interaction);
        }
    } catch (error) {
        console.error('Erro no botão:', error);
    }
});

// 4. LEITOR DE PREFIXO COM CAPTURA CORRIGIDA E DIRETA
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    let scriptPath = '';
    if (commandName === 'painel-id') scriptPath = './commands/rp/passaporte.js';
    if (commandName === 'painel-wl') scriptPath = './commands/rp/wl.js';
    if (commandName === 'painel-ticket') scriptPath = './commands/rp/ticket.js';
    if (commandName === 'painel-policia') scriptPath = './commands/rp/policia.js';

    if (scriptPath) {
        try {
            // Remove o cache para sempre ler a versão mais recente do arquivo
            delete require.cache[require.resolve(scriptPath)];
            const comando = require(scriptPath);
            if (comando && comando.executePrefix) {
                await comando.executePrefix(message);
            }
        } catch (error) {
            console.error(`Erro ao rodar !${commandName}:`, error);
            message.reply('❌ Ocorreu um erro interno ao carregar a lógica deste painel.');
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
