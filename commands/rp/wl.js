const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    // 🔒 Nome do comando barra que a Staff usa para fixar o painel na sala de exames
    data: new SlashCommandBuilder()
        .setName('painel-wl')
        .setDescription('🔒 Comando Staff: Envia o painel com o botão de iniciar o teste de White-List.'),

    // 🚨 A propriedade precisa ser obrigatoriamente "execute" para o seu index.js ler sem dar crash!
    async execute(interaction) {
        // Trava de segurança: Apenas quem possui permissões administrativas pode fixar o painel público
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ 
                content: '❌ **Acesso Negado!** Você não possui permissões administrativas para fixar o painel de exame civil.', 
                ephemeral: true 
            });
        }

        // 🎨 MOLDAGEM DO PAINEL PÚBLICO DE EXAMES DO GUETO RP
        const embedPrefeituraWL = new EmbedBuilder()
            .setTitle('🧱 SISTEMA CENTRAL DE WHITE-LIST — GUETO RP')
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
            .setFooter({ text: 'Gueto RP EXAM Core v4 — Correction 100% Automatizada' })
            .setTimestamp();

        // 🟢 BOTÃO CLEAN ADAPTADO: Totalmente sincronizado com o seu wl_botoes.js
        const { ActionRowBuilder: ARB, ButtonBuilder: BB } = require('discord.js');
        const linhaBotao = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('iniciar_wl_botao') // 🚨 ID IDÊNTICO ao que o seu wl_botoes.js escuta!
                .setLabel('📝 Iniciar White-List')
                .setStyle(ButtonStyle.Success) // Botão Verde Estético Minimalista
        );

        // Dispara a Embed pública com o botão no canal e responde o Staff em modo oculto
        try {
            await interaction.channel.send({ embeds: [embedPrefeituraWL], components: [linhaBotao] });
            return interaction.reply({ content: '✅ **Painel Enviado!** O painel de White-List foi injetado com sucesso.', ephemeral: true });
        } catch (error) {
            console.error('Erro ao enviar painel de WL:', error);
            return interaction.reply({ content: '❌ Erro mecânico ao tentar injetar a Embed neste canal.', ephemeral: true });
        }
    }
};
