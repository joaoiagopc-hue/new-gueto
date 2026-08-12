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

        // 🚨 CONFIGURAÇÃO DO BANNER DO TOPO: Insira o link direto da sua imagem (.png ou .jpg)
        const URL_BANNER_TOPO_PASSAPORTE = 'https://cdn.discordapp.com/attachments/1519870266216288270/1537202377378242600/content.png?ex=6a7e2ec6&is=6a7cdd46&hm=ceeb1c365cb3fbeebfd51c5736f085d8ddad82c2ebb1edb3d484d97fa333cdd3&'; 

        // 🎨 EMBED A: Carrega única e exclusivamente a foto mestre abrindo a caixa cinza
        const embedFotoTopo = new EmbedBuilder()
            .setColor('#2f3136');
        
        if (URL_BANNER_TOPO_PASSAPORTE && URL_BANNER_TOPO_PASSAPORTE.startsWith('http')) {
            embedFotoTopo.setImage(URL_BANNER_TOPO_PASSAPORTE);
        }

        // 🎨 EMBED B: Carrega o bloco de texto e as diretrizes coladas logo embaixo na mesma caixa
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
            .setFooter({ text: 'Gueto RP — Sistema Automatizado de Identidade Civil' })
            .setTimestamp();

        const linhaBotao = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('solicitar_id_botao')
                .setLabel('🪪 Solicitar ID')
                .setStyle(ButtonStyle.Success)
        );

        await interaction.deferReply({ ephemeral: true });

        try {
            // 🚀 FUSÃO MESTRE: Envia as duas embeds juntas no mesmo array para o Discord colar o bloco cinza!
            await interaction.channel.send({ 
                embeds: [embedFotoTopo, embedPrefeituraID], 
                components: [linhaBotao] 
            });
            
            return interaction.editReply({ content: '✅ **Painel Enviado!** O painel de passaportes com a foto fundida no topo do bloco foi fixado com sucesso.' });
        } catch (error) {
            console.error('Erro ao enviar painel de passaportes:', error);
            return interaction.editReply({ content: '❌ Erro mecânico ao tentar injetar a Embed de passaportes neste canal.' });
        }
    }
};
