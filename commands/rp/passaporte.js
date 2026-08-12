const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    // 🚨 Nome do comando barra que a Staff usa para fixar o painel na sala da prefeitura
    data: new SlashCommandBuilder()
        .setName('painel-id')
        .setDescription('🔒 Comando Staff: Envia o painel oficial com o botão de solicitar ID/Passaporte.'),

    async execute(interaction) {
        // Trava de segurança: Apenas quem possui permissões administrativas pode fixar o painel
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ 
                content: '❌ **Acesso Negado!** Você não possui permissões administrativas para fixar o painel de registros civis.', 
                ephemeral: true 
            });
        }

        // 🎨 MOLDAGEM DA EMBED OFICIAL CIVIL DA PREFEITURA
        const embedPrefeituraID = new EmbedBuilder()
            .setTitle('🧱 PREFEITURA CIVIL • EMISSÃO DE PASSAPORTES')
            .setDescription(
                `Seja muito bem-vindo ao Setor de Registro de Identidades!\n\n` +
                `Para iniciar a sua jornada em nossa cidade, comprar suas propriedades, veículos e se registrar nos sistemas legais ou facções, você precisa de um documento civil ativo.\n\n` +
                `⚙️ **INSTRUÇÕES DE SOLICITAÇÃO:**\n` +
                `┃ 📌 Clique no botão **\`🪪 Solicitar ID\`** localizado logo abaixo.\n` +
                `┃ 📌 O sistema vai abrir um formulário na sua tela perguntando seu Nick do Roblox.\n` +
                `┃ 📌 Seu nome no Discord será alterado automaticamente para o formato: \`ID | Nick\`.\n` +
                `┃ 📌 O cargo com ID será injetado no seu perfil para liberar o canal da White-List!\n\n` +
                `⚠️ *Evite clicar no botão mais de uma vez se já possuir um número cadastrado. A duplicação ou fraude de documentos gera punições civis pela administração.*`
            )
            .setColor('#2f3136')
            .setFooter({ text: 'Sistema Automatizado de Identidade Civil — PAFO' })
            .setTimestamp();

        // 🟢 BOTÃO CLEAN ADAPTADO: Sincronizado perfeitamente com o seu passaporte_botoes.js
        const linhaBotao = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('solicitar_id_botao') // 🚨 ID IDENTICO ao que o seu passaporte_botoes.js escuta!
                .setLabel('🪪 Solicitar ID')
                .setStyle(ButtonStyle.Success) // Botão Verde Clean Minimalista
        );

        try {
            await interaction.channel.send({ embeds: [embedPrefeituraID], components: [linhaBotao] });
            return interaction.reply({ content: '✅ **Painel Enviado!** O painel de emissão de passaportes com o botão ativo foi injetado na sala com sucesso.', ephemeral: true });
        } catch (error) {
            console.error('Erro ao enviar painel de passaportes:', error);
            return interaction.reply({ content: '❌ Erro mecânico ao tentar injetar a Embed de passaportes neste canal.', ephemeral: true });
        }
    }
};
