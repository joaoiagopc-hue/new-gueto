const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('passaporte')
        .setDescription('Consulta o número do seu passaporte/ID oficial ativo no servidor.'),

    async executePassaporteComando(interaction) {
        // Captura o apelido do jogador no servidor
        const apelidoMembro = interaction.member.displayName;

        // Executa uma expressão regular para capturar os números dentro dos colchetes [ID]
        const correspondenciaId = apelidoMembro.match(/^\[(\d+)\]/);

        if (!correspondenciaId) {
            return interaction.reply({ 
                content: '⚠️ **Nenhum Passaporte Localizado!** Você ainda não possui um número de ID registrado no seu nome. Clique no botão de solicitação na prefeitura!', 
                ephemeral: true 
            });
        }

        // Puxa o número do ID extraído do apelido do usuário
        const idExtraido = correspondenciaId[1];

        const embedConsulta = new EmbedBuilder()
            .setTitle('🪪 REGISTRO CIVIL — Consulta de Passaporte')
            .setDescription(`Olá! Aqui estão as informações do seu documento oficial ativo na cidade:\n\n👤 **Morador:** <@${interaction.user.id}>\n🆔 **Número do Passaporte (ID):** \`${idExtraido}\``)
            .setColor('#2f3136')
            .setFooter({ text: 'Gueto RP — Sistema de Identidade Civil via Nick' });

        return interaction.reply({ embeds: [embedConsulta], ephemeral: true });
    }
};
