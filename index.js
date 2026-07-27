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
                console.log(`✅ Comando encontrado: rp/${file}`);
            }
        } catch (e) { console.error(e); }
    }
}

client.once('ready', async () => {
    console.log(`🔥 ${client.user.tag} pronto para o Gueto RP Azul!`);
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('🔄 Sincronizando comandos de barra...');
        // 🚨 COLOQUE O ID NUMÉRICO REAL DO SEU SERVIDOR ABAIXO:
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, '1503073223477035260'), { body: commandsArray });
        console.log('🎉 Comandos registrados com sucesso!');
    } catch (error) { console.error(error); }
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
