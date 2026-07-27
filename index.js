const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config();

const app = express();
app.get('/', (req, res) => res.send('🚀 Bot do Gueto RP Azul Online!'));
app.listen(3000, () => console.log('📡 Servidor Web ativo.'));

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

client.commands = new Collection();
const commandsArray = [];

// ▬▬▬ LEITOR DIRETO E MANUAL (GARANTE 100% QUE VAI ENCONTRAR OS ARQUIVOS) ▬▬▬
const pastaRp = path.join(__dirname, 'commands/rp');
if (fs.existsSync(pastaRp)) {
    const arquivosRp = fs.readdirSync(pastaRp).filter(f => f.endsWith('.js') && f !== 'policia.js');
    for (const file of arquivosRp) {
        try {
            const filePath = path.join(pastaRp, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                commandsArray.push(command.data.toJSON());
                console.log(`✅ [SUCESSO] Comando estruturado encontrado: rp/${file}`);
            }
        } catch (e) { console.error(e); }
    }
}
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

client.once('ready', async () => {
    console.log(`🔥 [SISTEMA] ${client.user.tag} está pronto para o Gueto RP Azul!`);
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('🔄 [API] Sincronizando e forçando injeção de comandos...');
        
        // 🚨 CONFIGURAÇÃO DE INJEÇÃO DIRETA POR SERVIDOR
        // ATENÇÃO: Substitua os números abaixo pelo ID real do seu servidor do Gueto RP!
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, '1531002237705392291'), 
            { body: commandsArray }
        );
        
        console.log('🎉 [CONCLUÍDO] Todos os comandos foram injetados com sucesso no seu servidor!');
    } catch (error) { 
        console.error('❌ [API ERRO] Falha crítica no registro de comandos:', error); 
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try { await command.execute(interaction); } catch (e) { console.error(e); }
    }

    if (interaction.isButton() || interaction.isModalSubmit() || interaction.isStringSelectMenu()) {
        try {
            if (interaction.customId.includes('id') || interaction.customId.includes('solicitar')) {
                await require('./commands/admin/passaporte_botoes.js').handleInteraction(interaction);
            }
            if (interaction.customId.includes('wl') || interaction.customId.includes('whitelist') || interaction.customId.startsWith('wl_resp_')) {
                await require('./commands/admin/wl_botoes.js').handleInteraction(interaction, client);
            }
            if (interaction.customId.includes('ticket') || interaction.customId.includes('fechamento') || interaction.customId.includes('motivo')) {
                await require('./commands/admin/ticket_botoes.js').handleInteraction(interaction);
            }
        } catch (error) { console.error(error); }
    }
});

client.login(process.env.DISCORD_TOKEN);
