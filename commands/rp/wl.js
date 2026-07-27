const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('painel-wl')
        .setDescription('Envia o painel de Whitelist da cidade (Comando de Barra)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const iconeServidor = interaction.guild.iconURL({ dynamic: true, size: 512 });

        const embed = new EmbedBuilder()
            .setTitle('📝 ─── WHITELIST | GUETO RP ─── 📝')
            .setDescription(
                '👋 **Seja muito bem-vindo à nossa Verificação de Whitelist!**\n\n' +
                'Para manter a qualidade e o realismo dentro da nossa cidade de Brookhaven, todos os jogadores precisam passar por um teste rápido de regras básicas de Roleplay.\n\n' +
                '📖 **COMO FUNCIONA O EXAME:**\n' +
                '• Clique no botão azul escrito **"Fazer Whitelist"**.\n' +
                '• Um questionário secreto vai aparecer na sua tela instantaneamente.\n' +
                '• Responda marcando as alternativas de A a D com atenção.\n\n' +
                '⚠️ **REGRAS PARA APROVAÇÃO:**\n' +
                ' ➜ Mostre que você entende os conceitos reais de RP.\n' +
                ' ➜ É necessário gabaritar todas as questões para ser aprovado.\n' +
                ' ➜ Em caso de erro, você poderá estudar as regras e tentar novamente!'
            )
            .setColor('#0000ff') // Azul Oficial
            .setThumbnail(iconeServidor)
            .setFooter({ text: 'Gueto RP • Sistema de Admissão de Cidadãos', iconURL: iconeServidor })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('iniciar_wl_botao')
                .setLabel('Fazer Whitelist 📝')
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ content: '✅ Painel de Whitelist enviado com sucesso!', ephemeral: true });
        await interaction.channel.send({ embeds: [embed], components: [row] });
    }
};
