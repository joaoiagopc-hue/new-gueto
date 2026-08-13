const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('painel-id')
        .setDescription('🔒 Comando Staff: Envia o painel oficial com o botão de solicitar ID/Passaporte.'),

    async execute(interaction) {
        // Trava de segurança administrativa
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ 
                content: '❌ **Acesso Negado!** Você não possui permissões administrativas para fixar o painel de registros civis.', 
                ephemeral: true 
            });
        }

        // 🚨 CONFIGURAÇÃO DO BANNER: Insira aqui a URL direta do seu banner (.png ou .jpg) para aparecer embaixo do texto!
        const URL_BANNER_PASSAPORTE = 'https://cdn.discordapp.com/attachments/1519870266216288270/1537202377378242600/content.png?ex=6a7f8046&is=6a7e2ec6&hm=17ceecb55f2c901f238d8bb07c4375eb78492e4ff84527f9b274c644e86deb41&'; 

        // 🎨 MOLDAGEM DA EMBED CLASSICA DA PREFEITURA DO GUETO RP
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
            .setColor('#2f3136');

        if (URL_BANNER_PASSAPORTE && URL_BANNER_PASSAPORTE.startsWith('http')) {
            embedPrefeituraID.setImage(URL_BANNER_PASSAPORTE);
        }

        embedPrefeituraID.setFooter({ text: 'Gueto RP — Sistema Automatizado de Identidade Civil' }).setTimestamp();

        const linhaBotao = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('solicitar_id_botao')
                .setLabel('🪪 Solicitar ID')
                .setStyle(ButtonStyle.Success)
        );

        try {
            // 🚀 PASSO SEGURO V14: Envia primeiro o painel público e responde o comando barra na sequência imediata!
            await interaction.channel.send({ embeds: [embedPrefeituraID], components: [linhaBotao] });
            
            // Resposta nativa síncrona oculta super estável para travar o timeout na mesma hora!
            return interaction.reply({ content: '✅ **Painel Enviado!** O painel de passaportes clássico do Gueto RP foi fixado com sucesso no canal.', ephemeral: true });
        } catch (error) {
            console.error('Erro ao enviar painel de passaportes:', error);
            return interaction.reply({ content: '❌ Erro mecânico ao tentar injetar a Embed de passaportes neste canal.', ephemeral: true });
        }
    }
};
