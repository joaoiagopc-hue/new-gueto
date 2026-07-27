const { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config();

const app = express();
app.get('/', (req, res) => res.send('🚀 Bot do Gueto RP Azul Online!'));
app.listen(3000, () => console.log('📡 Servidor Web ativo.'));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
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
// 🚨 LEITOR DE COMANDOS POR TEXTO (POLÍCIA E DOCUMENTO)
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const textoMensagem = message.content.trim();

    // 1. COMANDO: !painel-policia
    if (textoMensagem.startsWith('!painel-policia')) {
        const scriptPath = './commands/rp/policia.js';
        try {
            delete require.cache[require.resolve(scriptPath)];
            await require(scriptPath).executePrefix(message);
        } catch (e) { console.error(e); }
        return;
    }

    // 2. COMANDO DE SISTEMA RP: !doc
    if (textoMensagem === '!doc') {
        try {
            await message.delete().catch(() => null);

            const apelidoAtual = message.member.displayName;
            const fotoUsuario = message.author.displayAvatarURL({ dynamic: true, size: 256 });

            let idExtraido = 'Não emitido';
            let nomeExtraido = apelidoAtual;

            if (apelidoAtual.includes('|') || apelidoAtual.includes('-')) {
                const divisor = apelidoAtual.includes('|') ? '|' : '-';
                const partes = apelidoAtual.split(divisor);
                idExtraido = partes[0].trim();
                nomeExtraido = partes[1].trim();
            } else if (/^\d+/.test(apelidoAtual)) {
                const match = apelidoAtual.match(/^(\d+)\s+(.+)$/);
                if (match) {
                    idExtraido = match[1];
                    nomeExtraido = match[2];
                }
            }

            await message.channel.send(`* 👤 **${message.author.username}** estica o braço e apresenta sua documentação oficial da cidade.*`);

            const embedDocumento = new EmbedBuilder()
                .setTitle('🪪 ─── REGISTRO GERAL | GUETO RP ─── 🪪')
                .setThumbnail(fotoUsuario)
                .setColor('#0000ff') 
                .addFields([
                    { name: '👤 CIDADÃO', value: `\`\`\`md\n> ${nomeExtraido}\n\`\`\``, inline: true },
                    { name: '🔢 REGISTRO (ID)', value: `\`\`\`fix\n#${idExtraido}\n\`\`\``, inline: true },
                    { name: '🟢 PROCEDÊNCIA', value: `\`\`\`yaml\nCidadão Verificado / Whitelist Aprovada\n\`\`\``, inline: false }
                ])
                .setFooter({ text: 'Gueto RP • Secretaria de Segurança Pública', iconURL: message.guild.iconURL({ dynamic: true }) })
                .setTimestamp();

            await message.channel.send({ embeds: [embedDocumento] });

        } catch (erroDoc) {
            console.error('Erro ao processar o comando !doc:', erroDoc);
        }
        return;
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
