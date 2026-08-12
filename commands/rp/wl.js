const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('painel-wl')
        .setDescription('🔒 Comando Staff: Envia o painel com o botão de iniciar o teste de White-List.'),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ content: '❌ **Acesso Negado!** Você não possui permissões administrativas para executar este comando.', ephemeral: true });
        }

        // 🚨 CONFIGURAÇÃO DO BANNER DO TOPO: Insira aqui a URL real do banner da sua White-List do Gueto RP!
        const URL_BANNER_TOPO_WL = 'https://chatgpt.com/backend-api/estuary/content?id=file_00000000b59c820e904bdb3e6449b31a&ts=496268&p=fs&cid=1&sig=407f9c5da15f3ee1d8d1b6ab7c57bf23fe88732f19e92d65bd1911ddee0a6f4f&v=0'; 

        // 🎨 MOLDAGEM DO PAINEL PÚBLICO DE EXAMES DO GUETO RP
        const embedPrefeituraWL = new EmbedBuilder()
            .setTitle('🧱 CENTRAL DE EXAMES • TESTE DE WHITE-LIST')
            .setDescription(
                `Para liberar o seu passaporte e iniciar a sua imersão em nossa cidade, você deve passar pelo nosso Exame de Diretrizes Civis Automatizado do **Gueto RP**.\n\n` +
                `O bot vai analisar o seu conhecimento sobre as regras básicas de sobrevivência do nosso simulador de Roleplay.\n\n` +
                `📊 **INFORMAÇÕES DO EXAME:**\n` +
                `┃ 📝 **Quantidade:** 7 Perguntas de Múltipla Escolha (A, B, C, D).\n` +
                `┃ 🎯 **Critério de Aprovação:** Você deve acertar pelo menos **4 de 7 perguntas** para passar!\n` +
                `┃ 🏅 **Resultado Automático:** O bot faz a correção, altera seus cargos e te libera no mesmo segundo!\n\n` +
                `👇 *Clique no botão verde abaixo para dar início ao seu teste direto neste canal:*`
            )
            .setColor('#2f3136')
            .setImage(URL_BANNER_TOPO_WL) // 🖼️ Injetado no topo do painel principal!
            .setFooter({ text: 'Gueto RP EXAM Core v4 — Correção 100% Automatizada' })
            .setTimestamp();

        const linhaBotao = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('iniciar_wl_botao')
                .setLabel('📝 Iniciar White-List')
                .setStyle(ButtonStyle.Success)
        );

        try {
            await interaction.channel.send({ embeds: [embedPrefeituraWL], components: [linhaBotao] });
            return interaction.reply({ content: '✅ **Painel Enviado!** O painel de White-List do Gueto RP com a foto no topo foi fixado com sucesso.', ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: '❌ Erro mecânico ao tentar injetar a Embed neste canal.', ephemeral: true });
        }
    }
};
