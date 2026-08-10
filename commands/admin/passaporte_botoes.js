const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// 🛠️ O SEU SISTEMA DE ARQUIVO TEXTO ORIGINAL DO PRINT:
const idFilePath = path.join(__dirname, '../../proximo_id.txt');

// 🚨 CONSERTO SUPREMO: Criamos a lógica e exportamos com os dois nomes (singular e plural)
// para alinhar perfeitamente com qualquer chamada que venha do seu index.js!
const executorDeInteracoes = async function(interaction) {
    // 🛠️ AS SUAS CONFIGURAÇÕES EXATAS DAS LINHAS 19, 20 E 21 DO PRINT
    const CONFIG = {
        CARGO_COM_ID: '1529945344241176738',
        CANAL_LOG_ID: '15298911922224088326' // COLOQUE O ID DO SEU CANAL DE LOGS DE IDENTIDADE
    };

    // 🎫 GATILHO OFICIAL DA SUA LINHA 24: Quando o morador clica no botão
    if (interaction.isButton() && interaction.customId === 'solicitar_id_botao') {
        
        // Suas travas nativas de segurança idênticas do print
        const jaPossuiCargo = interaction.member.roles.cache.has(CONFIG.CARGO_COM_ID);
        const jaTemIdNoNick = /^\d+/.test(interaction.member.displayName);

        if (jaPossuiCargo || jaTemIdNoNick) {
            // Nativo para Discord v14 evitar avisos de deprecado (utilizando flags em vez de ephemeral direto se necessário)
            return interaction.reply({ 
                content: '❌ **Bloqueado:** Você já possui um número de ID vinculado a este passaporte ou conta!', 
                flags: [64] // Garante resposta oculta estável
            });
        }

        // 🚨 ENGINE DO ARQUIVO .TXT CALIBRADA PARA O ID 319:
        if (!fs.existsSync(idFilePath)) {
            fs.writeFileSync(idFilePath, '319', 'utf8');
        }

        let proximoId = parseInt(fs.readFileSync(idFilePath, 'utf8'), 10);
        
        if (isNaN(proximoId) || proximoId < 319) {
            proximoId = 319;
        }

        const idCidadaoDefinitivo = proximoId;

        const idDoProximoCidadao = idCidadaoDefinitivo + 1;
        fs.writeFileSync(idFilePath, idDoProximoCidadao.toString(), 'utf8');

        // 🛠️ APELIDO SINCRO: Altera o nome do jogador injetando o ID na frente do Nick dele
        try {
            const nomeAtual = interaction.member.displayName.replace(/^\[\d+\]\s*/, '');
            await interaction.member.setNickname(`[${idCidadaoDefinitivo}] ${nomeAtual}`);
        } catch (error) {
            console.log('⚠️ Falha ao alterar apelido (Falta de hierarquia de cargo superior).');
        }

        // 🏅 ADIÇÃO DE CARGO AUTOMÁTICA: Entrega o cargo de ID ativo
        try {
            await interaction.member.roles.add(CONFIG.CARGO_COM_ID);
        } catch (error) {
            console.log('❌ Erro ao setar cargo. Certifique se o cargo do bot está no topo.');
        }

        // 🟥 EMBED DE LOGS INTERNOS DO SEU CANAL DE CONFIGURAÇÃO (Linha 21)
        try {
            const canalLogs = await interaction.guild.channels.fetch(CONFIG.CANAL_LOG_ID);
            const embedLog = new EmbedBuilder()
                .setTitle('🪪 NOVO PASSAPORTE EMITIDO')
                .setDescription(`O cidadão <@${interaction.user.id}> gerou seu registro civil com sucesso!`)
                .addFields(
                    { name: '🆔 ID Concedido', value: `\`#${idCidadaoDefinitivo}\``, inline: true },
                    { name: '👤 Morador', value: `${interaction.user.tag}`, inline: true }
                )
                .setColor('#00ff00')
                .setTimestamp();
            await canalLogs.send({ embeds: [embedLog] });
        } catch (e) {
            console.log('⚠️ Canal de logs não localizado ou sem permissão de escrita.');
        }

        // Retorna a resposta de sucesso na tela do morador de forma oculta estável
        return interaction.reply({ 
            content: `✅ **Passaporte Gerado!** Sua identidade foi vinculada de forma esmero.\n┃ 🆔 **Seu Número de ID:** \`#${idCidadaoDefinitivo}\` (Iniciado na série 319)\n┃ 🏅 O cargo correspondente foi injetado no seu perfil!`, 
            flags: [64]
        });
    }
};

// 🚨 EXPORTAÇÃO DUPLA DE SEGURANÇA: Responde tanto no singular quanto no plural!
module.exports = {
    handleInteraction: executorDeInteracoes,
    handleInteractions: executorDeInteracoes
};
