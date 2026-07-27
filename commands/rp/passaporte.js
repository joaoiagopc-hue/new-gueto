const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('painel-id')
        .setDescription('Envia o painel de solicitação de ID da cidade (Comando de Barra)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const icone = interaction.guild.iconURL({ dynamic: true, size: 512 });
        const embed = new EmbedBuilder()
            .setTitle('💥 ─── CIDADANIA | GUETO RP ─── 💥')
            .setDescription('👋 **Seja muito bem-vindo à nossa Central de Identidade!**\n\nPara conseguir o acesso livre à nossa cidade de Brookhaven, você precisa gerar o seu número de registro oficial em nosso sistema.\n\n📜 **COMO FUNCIONA O PROCESSO:**\n• Clique no botão abaixo verde escrito **"Solicitar ID"**.\n• Digite o seu **Nick do Roblox** idêntico ao do jogo.\n• O bot vai gerar um ID sequencial único para você instantaneamente!\n\n⚠️ **AVISOS IMPORTANTES:**\n ➜ O seu nome aqui no Discord será alterado para: `[ID] | [Seu Nick]`.\n ➜ Você receberá o cargo oficial de "Com ID" liberando o acesso ao canal de Whitelist.\n ➜ Guarde bem o seu número, ele será sua identidade no Brookhaven!')
            .setColor('#0000ff')
            .setThumbnail(icone)
            .setFooter({ text: 'Gueto RP • Sistema de Identidade Automatizado', iconURL: icone })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('solicitar_id_botao').setLabel('Solicitar ID 🪪').setStyle(ButtonStyle.Success)
        );
        await interaction.reply({ content: '✅ Painel enviado!', ephemeral: true });
        await interaction.channel.send({ embeds: [embed], components: [row] });
    }
};
