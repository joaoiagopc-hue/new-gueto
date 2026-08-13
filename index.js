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

// 🚨 MEMÓRIA CORE: Inicializa o mapa de sessoes da Whitelist no nascimento do bot
client.wlSessoes = new Map();

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
    console.log('🧱 [BOT HELP] Central online operando rotas de subpastas completas e sem timeouts!');

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
        // 🚨 CRAVADO NO CÓDIGO: ID oficial do seu servidor para carregar na hora!
        const GUETO_SERVER_ID = '1503073223477035260'; 

        console.log(`🔄 Sincronizando e forçando comandos locais no servidor ID: ${GUETO_SERVER_ID}...`);
        
        // Injeta os comandos barra direto na raiz do seu servidor limpando o cache instantaneamente
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, GUETO_SERVER_ID),
            { body: commands }
        );
        
        console.log('⚡ [SUCESSO LOCAL] Todos os comandos barra foram injetados e atualizados na hora!');
    } catch (error) {
        console.error('❌ Erro crítico ao injetar os comandos barra:', error);
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
    // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
    // 📌 1. DISTRIBUIDOR DOS COMANDOS DE BARRA (/)
    // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;
        console.log(`📡 [SLASH] Executando: /${commandName}`);

        if (commandName === 'painel-ticket') {
            const m = carregarModuloSeguro('commands/rp/ticket.js');
            if (m && typeof m.execute === 'function') return await m.execute(interaction);
        }
        if (commandName === 'top-avaliar') {
            const m = carregarModuloSeguro('commands/rp/ticket.js');
            if (m && typeof m.executeRanking === 'function') return await m.executeRanking(interaction);
        }
        if (commandName === 'painel-armadilha') {
            const m = carregarModuloSeguro('commands/rp/armadilha.js');
            if (m && typeof m.executePrefixArmadilha === 'function') return await m.executePrefixArmadilha(interaction);
        }
        if (commandName === 'cria-embed') {
            const m = carregarModuloSeguro('commands/admin/cria_embed.js');
            if (m) {
                if (typeof m.executeSlashCriaEmbed === 'function') return await m.executeSlashCriaEmbed(interaction);
                if (typeof m.execute === 'function') return await m.execute(interaction);
            }
        }
        if (commandName === 'painel-id') {
            const m = carregarModuloSeguro('commands/rp/passaporte.js');
            if (m && typeof m.execute === 'function') return await m.execute(interaction);
        }
        if (commandName === 'painel-wl') {
            const m = carregarModuloSeguro('commands/rp/wl.js');
            if (m && typeof m.execute === 'function') return await m.execute(interaction);
        }
        return;
    }

    // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
    // 📌 2. DISTRIBUIDOR DE COMPONENTES INTERNOS (BOTÕES E FORMULÁRIOS)
    // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
    if (interaction.isButton() || interaction.isModalSubmit()) {
        const customId = interaction.customId || '';
        console.log(`🎯 [INTERAÇÃO] Componente acionado: ${customId}`);

        // 🎫 Rota Unificada do Painel de Tickets
        if (customId.includes('ticket') || customId.includes('atendente') || customId.startsWith('nota_')) {
            const ticketModule = carregarModuloSeguro('commands/admin/ticket_botoes.js');
            if (ticketModule) {
                if (typeof ticketModule.processarTudo === 'function') return await ticketModule.processarTudo(interaction);
                if (typeof ticketModule.handleInteraction === 'function') return await ticketModule.handleInteraction(interaction);
                if (typeof ticketModule.handleInteractions === 'function') return await ticketModule.handleInteractions(interaction);
            }
        }

        // 🪪 Rota Unificada do Passaporte / Solicitar ID
        if (customId.includes('id') || customId.includes('passaporte') || customId.includes('roblox')) {
            const passaporteModule = carregarModuloSeguro('commands/admin/passaporte_botoes.js');
            if (passaporteModule) {
                if (typeof passaporteModule.processarFluxoId === 'function') return await passaporteModule.processarFluxoId(interaction);
                if (typeof passaporteModule.handleInteraction === 'function') return await passaporteModule.handleInteraction(interaction);
                if (typeof passaporteModule.handleInteractions === 'function') return await passaporteModule.handleInteractions(interaction);
            }
        }

        // 📝 Rota Unificada do Exame de White-List
        if (customId.includes('wl') || customId.startsWith('wl_resp_')) {
            const wlModule = carregarModuloSeguro('commands/admin/wl_botoes.js');
            if (wlModule) {
                if (typeof wlModule.processarWLAUTOMATICA === 'function') return await wlModule.processarWLAUTOMATICA(interaction);
                if (typeof wlModule.handleInteraction === 'function') return await wlModule.handleInteraction(interaction);
                if (typeof wlModule.handleInteractions === 'function') return await wlModule.handleInteractions(interaction);
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
