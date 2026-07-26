const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'painel-id',
    description: 'Envia o painel de solicitação de ID da cidade por prefixo',
    async executePrefix(message) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Você não tem permissão para usar este comando.');
        }

        const iconeServidor = message.guild.iconURL({ dynamic: true, size: 512 });

        const embed = new EmbedBuilder()
            .setTitle('💥 ─── CIDADANIA | GUETO RP ─── 💥')
            .setDescription(
                '👋 **Seja muito bem-vindo à nossa Central de Identidade!**\n\n' +
                'Para conseguir o acesso livre à nossa cidade de Brookhaven, você precisa gerar o seu número de registro oficial em nosso sistema.\n\n' +
                '📜 **COMO FUNCIONA O PROCESSO:**\n' +
                '• Clique no botão abaixo verde escrito **"Solicitar ID"**.\n' +
                '• Digite o seu **Nick do Roblox** idêntico ao do jogo.\n' +
                '• O bot vai gerar um ID sequencial único para você instantaneamente!\n\n' +
                '⚠️ **AVISOS IMPORTANTES:**\n' +
                ' ➜ O seu nome aqui no Discord será alterado para: `[ID] | [Seu Nick]`.\n' +
                ' ➜ Você receberá o cargo oficial de "Com ID" liberando o acesso ao canal de Whitelist.\n' +
                ' ➜ Guarde bem o seu número, ele será sua identidade no Brookhaven!'
            )
            .setColor('#0000ff')
            .setThumbnail(iconeServidor)
            .setFooter({ text: 'Gueto RP • Sistema de Identidade Automatizado', iconURL: iconeServidor })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('solicitar_id_botao')
                .setLabel('Solicitar ID 🪪')
                .setStyle(ButtonStyle.Success)
        );

        try {
            await message.delete();
        } catch (err) { console.log(err); }

        await message.channel.send({ embeds: [embed], components: [row] });
    }
};
