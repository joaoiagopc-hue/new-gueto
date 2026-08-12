const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('painel-wl')
        .setDescription('🔒 Comando Staff: Envia o painel com o botão de iniciar o teste de White-List.'),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ content: '❌ **Acesso Negado!** Você não possui permissões administrativas para executar este comando.', ephemeral: true });
        }

        // 🚨 CONFIGURAÇÃO DO BANNER DO TOPO: Pegue o link que termine obrigatoriamente com .png ou .jpg! [➔]
        const URL_BANNER_TOPO_WL = 'https://cdn.discordapp.com/attachments/1519870266216288270/1537202417547083826/content.png?ex=6a7e2ed0&is=6a7cdd50&hm=21b547a1492d8ea08ae99a4338dfa89acad956532a795898b7e6978858846a3d&'; 

        const embedPrefeituraWL = new EmbedBuilder()
            .setTitle('🧱 CENTRAL DE EXAMES • TESTE DE WHITE-LIST')
            .setDescription(
                `Para liberar o seu passaporte e iniciar a sua imersão em nossa cidade, você deve passar pelo nosso Exame de Diretrizes Civis Automatizado do **Gueto RP**.\n\n` +
                `O bot vai analisar o seu conhecimento sobre as regras básicas de sobrevivência do nosso simulador de Roleplay.\n\n` +
                `📊 **INFORMAÇÕES DO EXAME:**\n` +
                `┃ 📝 **Quantidade:** 7 Perguntas de Múltipla Escolha (A, B, C, D).\n` +
                `┃ 🎯 **Critério de Approvação:** Você deve acertar pelo menos **4 de 7 perguntas** para passar!\n` +
                `┃ 🏅 **Resultado Automático:** O bot faz a correção, altera seus cargos e te libera no mesmo segundo!\n\n` +
                `👇 *Clique no botão verde abaixo para dar início ao seu teste direto neste canal:*`
            )
            .setColor('#2f3136');

        // Se o link for preenchido corretamente, injeta a imagem no topo do painel principal [➔]
        if (URL_BANNER_TOPO_WL && URL_BANNER_TOPO_WL.startsWith('http')) {
            embedPrefeituraWL.setImage(URL_BANNER_TOPO_WL);
        }

        embedPrefeituraWL.setFooter({ text: 'Gueto RP EXAM Core v4 — Correção 100% Automatizada' }).setTimestamp();

        const linhaBotao = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('iniciar_wl_botao')
                .setLabel('📝 Iniciar White-List')
                .setStyle(ButtonStyle.Success)
        );

        try {
            await interaction.channel.send({ embeds: [embedPrefeituraWL], components: [linhaBotao] });
            return interaction.reply({ content: '✅ **Painel Enviado!** O painel de White-List com a foto no topo foi fixado com sucesso.', ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: '❌ Erro mecânico ao tentar injetar a Embed neste canal.', ephemeral: true });
        }
    }
};
