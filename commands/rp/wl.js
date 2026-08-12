const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('painel-wl')
        .setDescription('🔒 Comando Staff: Envia o painel com o botão de iniciar o teste de White-List.'),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ content: '❌ **Acesso Negado!** Você não possui permissões administrativas para executar este comando.', ephemeral: true });
        }

        const embedPrefeituraWL = new EmbedBuilder()
            .setTitle('🧱 SISTEMA CENTRAL DE WHITE-LIST — PAFO SYSTEM')
            .setDescription(
                `Para liberar o seu passaporte e iniciar a sua imersão em nossa cidade, você deve passar pelo nosso Exame de Diretrizes Civis Automatizado.\n\n` +
                `O bot vai analisar o seu conhecimento sobre as regras básicas de sobrevivência do nosso simulador de Roleplay.\n\n` +
                `📊 **INFORMAÇÕES DO EXAME:**\n` +
                `┃ 📝 **Quantidade:** 7 Perguntas de Múltipla Escolha (A, B, C, D).\n` +
                `┃ 🎯 **Critério de Aprovação:** Você deve acertar pelo menos **4 de 7 perguntas** para passar!\n` +
                `┃ 🏅 **Resultado Automático:** O bot faz a correção, altera seus cargos e te libera no mesmo segundo!\n\n` +
                `👇 *Clique no botão verde abaixo para dar início ao seu teste direto neste canal:*`
            )
            .setColor('#2f3136')
            .setFooter({ text: 'PAFO EXAM Core v4 — Correção 100% Automatizada' })
            .setTimestamp();

        const linhaBotao = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('iniciar_wl_botao') // 🚨 ID IDENTICO ao que o seu wl_botoes.js escuta!
                .setLabel('📝 Iniciar White-List')
                .setStyle(ButtonStyle.Success)
        );

        try {
            await interaction.channel.send({ embeds: [embedPrefeituraWL], components: [linhaBotao] });
            return interaction.reply({ content: '✅ **Painel Enviado!** O painel de White-List foi injetado com sucesso.', ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: '❌ Erro mecânico ao tentar injetar a Embed neste canal.', ephemeral: true });
        }
    }
};
