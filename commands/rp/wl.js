const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('painel-wl')
        .setDescription('Envia o painel de Whitelist da cidade (Design Premium)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('📝 GUETO RP • Verificação de Whitelist')
            .setDescription(
                `Canal oficial: <#${interaction.channel.id}>\n\n` +
                'Sistema ativo para avaliar conhecimentos básicos e garantir a qualidade do simulador. O exame de admissão é obrigatório para todos.\n\n' +
                '┃ Clique no botão azul abaixo escrito **"Fazer Whitelist"**.\n' +
                '┃ Responda ao questionário secreto de **7 perguntas** de múltipla escolha.\n' +
                '┃ É necessário acertar pelo menos **3 questões** para receber sua aprovação.\n' +
                '┃ Caso clique em "Ignorar mensagem" ou feche, o teste sofrerá auto-reset.\n\n' +
                '✅ **Verificações ativas:** Respostas automáticas, proteção anti-duplicação de prova.\n' +
                '🚫 **Candidatos reprovados:** 14\n' +
                '🟨 **Moradores aprovados:** Ativo\n' +
                '*GUETO RP — Whitelist System*'
            )
            .setColor('#2f3136');

        const rowBotoes = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('iniciar_wl_botao').setLabel('Fazer Whitelist 📝').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('status_fake_wl').setLabel('📝 Status: Correção em Tempo Real').setStyle(ButtonStyle.Danger).setDisabled(true)
        );

        await interaction.reply({ content: '✅ Painel de Whitelist enviado com os botões atualizados!', ephemeral: true });
        await interaction.channel.send({ embeds: [embed], components: [rowBotoes] });
    }
};
