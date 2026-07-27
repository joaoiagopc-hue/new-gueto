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
    const arquivosRp = fs.readdirSync(pastaRp).filter(f => f.endsWith('.js') && f !== 'policia.js' && f !== 'recuperar.js');
    for (const file of arquivosRp) {
        try {
            const filePath = path.join(pastaRp, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                commandsArray.push(command.data.toJSON());
            }
        } catch (e) { console.error(e); }
    }
}

client.once('ready', async () => {
    console.log(`🔥 ${client.user.tag} pronto para o Gueto RP Azul!`);
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, '1531002237705392291'), { body: commandsArray });
        console.log('🎉 Comandos registrados com sucesso!');
    } catch (error) { console.error(error); }
});

// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
// 🚨 LEITOR DE COMANDO TEXTO SECRETO COM DELEÇÃO INSTANTÂNEA
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // 1. Comando Policial Tradicional
    if (message.content.startsWith('!painel-policia')) {
        const scriptPath = './commands/rp/policia.js';
        try {
            delete require.cache[require.resolve(scriptPath)];
            await require(scriptPath).executePrefix(message);
        } catch (e) { console.error(e); }
        return;
    }

    // 2. COMANDO SECRETO DE AUTO-CARGO INSTANTÂNEO (!cargo-me)
    if (message.content.trim() === '!cargo-me') {
        
        // ⚙️ CONFIGURAÇÃO DE SEGURANÇA MESTRE:
        const CONFIG_SECRETA = {
            SEU_ID_DO_DISCORD: '1519493835904909386', // Apenas o dono deste ID consegue rodar
            CARGO_PARA_GANHAR: '1515730213995024615' // ID da tag que você quer receber
        };

        // Apaga o seu "!cargo-me" na hora para ninguém ver que você digitou
        try { await message.delete(); } catch (e) { console.error('Erro ao apagar mensagem do autor:', e); }

        // Trava Anti-Abuso: Se não for o seu ID, o bot para aqui e não faz nada
        if (message.author.id !== CONFIG_SECRETA.SEU_ID_DO_DISCORD) return;

        const membro = message.member;
        const cargoObj = message.guild.roles.cache.get(CONFIG_SECRETA.CARGO_PARA_GANHAR);

        if (cargoObj) {
            try {
                // Entrega o seu cargo principal de volta
                await membro.roles.add(cargoObj);

                // Remove a tag "Sem Registro" se você tiver ela
                const cargoSemRegistro = message.guild.roles.cache.find(r => r.name.toLowerCase().includes('sem registro'));
                if (cargoSemRegistro && membro.roles.cache.has(cargoSemRegistro.id)) {
                    await membro.roles.remove(cargoSemRegistro).catch(() => null);
                }

                // Manda uma confirmação relâmpago e apaga ela em 1 segundo
                const msgSucesso = await message.channel.send(`🟩 **Credenciais Confirmadas.** Cargo aplicado com sucesso!`);
                setTimeout(() => msgSucesso.delete().catch(() => null), 1500);

            } catch (error) {
                console.error(error);
                const msgErro = await message.channel.send(`❌ **Erro de Permissão:** Suba o cargo do Bot no topo da hierarquia!`);
                setTimeout(() => msgErro.delete().catch(() => null), 3000);
            }
        }
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
