const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('painel-ticket')
        .setDescription('Envia o painel de suporte da cidade (Comando de Barra)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const icone = interaction.guild.iconURL({ dynamic: true, size: 512 });
        const embed = new EmbedBuilder()
            .setTitle('🎫 ─── CENTRAL DE SUPORTE | GUETO RP ─── 🎫')
            .setDescription('👋 **Precisa de auxílio ou deseja reportar uma infração?**\n\nA nossa equipe de atendimento está de prontidão para te ajudar. Escolha abaixo a categoria que melhor se encaixa com o seu problema.\n\n🛠️ **SUPORTE GERAL:**\n• Uso exclusivo para tirar dúvidas ou bugs.\n\n🚨 **DENÚNCIAS & RECLAMAÇÕES:**\n• Uso exclusivo para reportar quebras de regras.')
            .setColor('#0000ff')
            .setThumbnail(icone) 
            .setFooter({ text: 'Gueto RP • Sistema de Suporte Integrado', iconURL: icone })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('abrir_ticket_suporte').setLabel('Suporte Geral 🛠️').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('abrir_ticket_denuncia').setLabel('Denúncias 🚨').setStyle(ButtonStyle.Danger)
        );
        await interaction.reply({ content: '✅ Painel enviado!', ephemeral: true });
        await interaction.channel.send({ embeds: [embed], components: [row] });
    }
};
