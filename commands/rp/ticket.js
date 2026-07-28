const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('painel-ticket')
        .setDescription('Envia o painel de suporte da cidade (Design Premium)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🎫 GUETO RP • Central de Suporte')
            .setDescription(
                `Atendimento: **Disponível 24/7**\n\n` +
                'Sistema ativo para gerenciar denúncias contra quebras de diretrizes, relatórios de bugs e dúvidas gerais sobre a jogabilidade.\n\n' +
                '┃ Canais abertos por este painel são privados entre você e a equipe.\n' +
                '┃ Mensagem troll ou abuso do sistema recebe **warn administrativo**.\n' +
                '┃ Utilize a categoria correta para agilizar o tempo de resposta da Staff.\n' +
                '┃ Ao encerrar, o morador poderá avaliar o suporte de **1 a 5 estrelas**.\n\n' +
                '✅ **Verificações ativas:** Logs criptografadas, avaliação de staff e pings automáticos.\n' +
                '🚫 **Chamados perigosos neutralizados:** 4\n' +
                '🟨 **Atendimentos concluídos:** Registro ativo\n' +
                '*GUETO RP — Ticket System*'
            )
            .setColor('#2f3136');

        const rowBotoes = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('abrir_ticket_suporte').setLabel('Suporte Geral 🛠️').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('abrir_ticket_denuncia').setLabel('Denúncias 🚨').setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({ content: '✅ Painel de Tickets enviado com os botões atualizados!', ephemeral: true });
        await interaction.channel.send({ embeds: [embed], components: [rowBotoes] });
    }
};
