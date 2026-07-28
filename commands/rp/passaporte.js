const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('painel-id')
        .setDescription('Envia o painel de solicitação de ID da cidade (Design Premium)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🪪 GUETO RP • Central de Passaporte')
            .setDescription(
                `Canal oficial: <#${interaction.channel.id}>\n\n` +
                'Sistema ativo para emissão de registro civil automatizado. Todos os novos moradores precisam gerar sua numeração oficial antes de prosseguir.\n\n' +
                '┃ Para conseguir o acesso, você precisa vincular sua conta do jogo.\n' +
                '┃ Clique no botão verde abaixo escrito **"Solicitar ID"**.\n' +
                '┃ Digite o seu **Nick do Roblox** idêntico ao do jogo do Brookhaven.\n' +
                '┃ O bot alterará seu nome para: `[ID] | [Seu Nick]` de forma imediata.\n\n' +
                '✅ **Verificações ativas:** Banco de dados integrado, trava anti-duplicação de identidade.\n' +
                '🚫 **Passaportes revogados:** 0\n' +
                '🟨 **Cidadãos registrados:** Ativo\n' +
                '*GUETO RP — Identity System*'
            )
            .setColor('#2f3136');

        const rowBotoes = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('solicitar_id_botao').setLabel('Solicitar ID 🪪').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('status_fake_id').setLabel('🪪 Emissão: 100% Automática').setStyle(ButtonStyle.Danger).setDisabled(true)
        );

        await interaction.reply({ content: '✅ Painel de ID enviado com os botões atualizados!', ephemeral: true });
        await interaction.channel.send({ embeds: [embed], components: [rowBotoes] });
    }
};
