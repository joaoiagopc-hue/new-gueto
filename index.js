const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config();

// 1. SERVIDOR WEB (Para o UptimeRobot manter o bot do Gueto RP 24h online no Render)
const app = express();
app.get('/', (req, res) => res.send('🚀 Novo Bot do Gueto RP está online e operando no Brookhaven!'));
app.listen(3000, () => console.log('📡 Servidor Web do Gueto RP iniciado.'));

// 2. INICIALIZAÇÃO DO BOT
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

// 3. EVENTO: BOT ONLINE E RESET DO CACHE DE BARRAS
client.once('ready', async () => {
    console.log(`🔥 ${client.user.tag} está pronto para o Gueto RP (Edição Azul)!`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('🔄 Limpando totalmente registros antigos de comandos de barra...');
        
        // Zera o cache global e do servidor para o chat rodar apenas por prefixo texto (!)
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });
        
        // ATENÇÃO: Se quiser limpar instantaneamente o cache da guilda, coloque o ID do seu servidor abaixo
        // await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, '1503073223477035260'), { body: [] });
        
        console.log('🎉 Comandos de barra limpos! Rodando exclusivamente por prefixo (!).');
    } catch (error) {
        console.error('❌ Erro ao limpar comandos:', error);
    }
});

// 4. EVENTO: GERENCIADOR DE BOTÕES, MODALS E MENUS INTERNOS
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton() && !interaction.isModalSubmit() && !interaction.isStringSelectMenu()) return;

    try {
        // ID Automático
        if (interaction.customId.includes('id') || interaction.customId.includes('solicitar')) {
            const idBotoes = require('./commands/admin/passaporte_botoes.js');
            await idBotoes.handleInteraction(interaction);
        }
        // Whitelist por chat
        if (interaction.customId.includes('wl') || interaction.customId.includes('whitelist')) {
            const wlBotoes = require('./commands/admin/wl_botoes.js');
            await wlBotoes.handleInteraction(interaction);
        }
        // Central de Tickets/Suporte
        if (interaction.customId.includes('ticket') || interaction.customId.includes('fechamento') || interaction.customId.includes('motivo')) {
            const ticketBotoes = require('./commands/admin/ticket_botoes.js');
            await ticketBotoes.handleInteraction(interaction);
        }
    } catch (error) {
        console.error('Erro na interação de botão/modal:', error);
    }
});

// 5. EVENTO: GERENCIADOR COMPACTO DE COMANDOS TRADICIONAIS POR PREFIXO (!)
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Mapeamento dos arquivos de prefixo diretos
    let scriptPath = '';
    if (commandName === 'painel-policia') scriptPath = './commands/rp/policia.js';
    if (commandName === 'painel-id') scriptPath = './commands/rp/passaporte.js';
    if (commandName === 'painel-wl') scriptPath = './commands/rp/wl.js';
    if (commandName === 'painel-ticket') scriptPath = './commands/rp/ticket.js';

    if (scriptPath) {
        try {
            const comando = require(scriptPath);
            if (comando && comando.executePrefix) {
                await comando.executePrefix(message);
            }
        } catch (error) {
            console.error(`Erro ao carregar !${commandName}:`, error);
            message.reply('❌ Erro interno ao processar este painel.');
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
