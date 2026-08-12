const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('painel-id')
        .setDescription('🔒 Comando Staff: Envia o painel oficial com o botão de solicitar ID/Passaporte.'),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ 
                content: '❌ **Acesso Negado!** Você não possui permissões administrativas para fixar o painel de registros civis.', 
                ephemeral: true 
            });
        }

        // 🚨 CONFIGURAÇÃO DO BANNER DO TOPO: Insira aqui a URL real do banner do seu passaporte do Gueto RP!
        const URL_BANNER_TOPO_PASSAPORTE = 'https://chatgpt.com/backend-api/estuary/content?id=file_00000000c7d4820e96eee62f3bcab2d1&ts=496268&p=fs&cid=1&sig=7af62fa9e763de0873f2b580664f074fd4d322522ac730e9c0fafec3da0a82ee&v=0'; 

        // 🎨 MOLDAGEM DA EMBED OFICIAL CIVIL DA PREFEITURA DO GUETO RP
        const embedPrefeituraID = new EmbedBuilder()
            .setTitle('🧱 PREFEITURA CIVIL • EMISSÃO DE PASSAPORTES')
            .setDescription(
                `Seja muito bem-vindo ao Setor de Registro de Identidades do **Gueto RP**!\n\n` +
                `Para iniciar a sua jornada em nossa cidade, comprar suas propriedades, veículos e se registrar nos sistemas legais ou facções, você precisa de um documento civil ativo.\n\n` +
                `⚙️ **INSTRUÇÕES DE SOLICITAÇÃO:**\n` +
                `┃ 📌 Clique no botão **\`🪪 Solicitar ID\`** localizado logo abaixo.\n` +
                `┃ 📌 O sistema vai abrir um formulário na sua tela perguntando seu Nick do Roblox.\n` +
                `┃ 📌 Seu nome no Discord será alterado automaticamente para o formato: \`ID | Nick\`.\n` +
                `┃ 📌 O cargo com ID será injetado no seu perfil para liberar o canal da White-List!\n\n` +
                `⚠️ *Evite clicar no botão mais de uma vez se já possuir um número cadastrado. A duplicação ou fraude de documentos gera punições civis pela administração.*`
            )
            .setColor('#2f3136')
            .setImage(URL_BANNER_TOPO_PASSAPORTE) // 🖼️ Injetado no topo do painel principal!
            .setFooter({ text: 'Gueto RP — Sistema Automatizado de Identidade Civil' })
            .setTimestamp();

        const linhaBotao = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('solicitar_id_botao')
                .setLabel('🪪 Solicitar ID')
                .setStyle(ButtonStyle.Success)
        );

        try {
            await interaction.channel.send({ embeds: [embedPrefeituraID], components: [linhaBotao] });
            return interaction.reply({ content: '✅ **Painel Enviado!** O painel de passaportes do Gueto RP com a foto no topo foi fixado com sucesso.', ephemeral: true });
        } catch (error) {
            console.error('Erro ao enviar painel de passaportes:', error);
            return interaction.reply({ content: '❌ Erro mecânico ao tentar injetar a Embed de passaportes neste canal.', ephemeral: true });
        }
    }
};
