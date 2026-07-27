const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('painel-ticket')
        .setDescription('Envia o painel de atendimento e suporte profissional (Comando de Barra)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const iconeServidor = interaction.guild.iconURL({ dynamic: true, size: 512 });

        const embed = new EmbedBuilder()
            .setTitle('🎫 ─── CENTRAL DE SUPORTE | GUETO RP ─── 🎫')
            .setDescription(
                '👋 **Precisa de auxílio ou deseja reportar uma infração?**\n\n' +
                'A nossa equipe de atendimento está de prontidão para te ajudar. Escolha abaixo a categoria que melhor se encaixa com o seu problema.\n\n' +
                '🛠️ **SUPORTE GERAL:**\n• Uso exclusivo para tirar dúvidas ou bugs.\n\n' +
                '🚨 **DENÚNCIAS & RECLAMAÇÕES:**\n• Uso exclusivo para reportar quebras de regras.'
            )
            .setColor('#0000ff')
            .setThumbnail(iconeServidor) 
            .setFooter({ text: 'Gueto RP • Sistema de Suporte Integrado', iconURL: iconeServidor })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('abrir_ticket_suporte').setLabel('Suporte Geral 🛠️').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('abrir_ticket_denuncia').setLabel('Denúncias 🚨').setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({ content: '✅ Painel enviado com sucesso!', ephemeral: true });
        await interaction.channel.send({ embeds: [embed], components: [row] });
    }
};
