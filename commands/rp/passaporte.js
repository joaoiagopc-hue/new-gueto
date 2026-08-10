const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    // 🚨 FIX 1: Alterado o nome do comando barra para bater exatamente com o seu /painel-id do print!
    data: new SlashCommandBuilder()
        .setName('painel-id')
        .setDescription('Consulta o número do seu passaporte/ID oficial ativo no servidor.'),

    // 🚨 FIX 2: O nome da função precisa ser obrigatoriamente "execute" para o seu index.js ler sem dar crash!
    async execute(interaction) {
        // Captura o apelido do jogador no servidor
        const apelidoMembro = interaction.member.displayName;

        // Executa a expressão regular para capturar os números dentro dos colchetes [ID]
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
