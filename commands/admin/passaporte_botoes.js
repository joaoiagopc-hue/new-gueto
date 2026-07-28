const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const idFilePath = path.join(__dirname, '../../proximo_id.txt');

function gerarProximoID() {
    if (!fs.existsSync(idFilePath)) {
        fs.writeFileSync(idFilePath, '80'); // Começando a contagem a partir do ID 80
    }
    const idAtual = parseInt(fs.readFileSync(idFilePath, 'utf8'), 10);
    const proximoId = idAtual + 1;
    fs.writeFileSync(idFilePath, proximoId.toString());
    return idAtual;
}

module.exports = {
    async handleInteraction(interaction) {
        const CONFIG = {
          CARGO_COM_ID: '1529945344241176738', 
            CANAL_LOG_ID: '1529891192224088326'  // 🚨 COLOQUE O ID DO SEU CANAL DE LOGS DE IDENTIDADE
        };

        if (interaction.customId === 'solicitar_id_botao') {
            const jaPossuiCargo = interaction.member.roles.cache.has(CONFIG.CARGO_COM_ID);
            const jaTemIdNoNick = /^\d+/.test(interaction.member.displayName);

            if (jaPossuiCargo || jaTemIdNoNick) {
                return interaction.reply({ content: '⚠️ **Bloqueado:** Você já possui um número de ID vinculado a este passaporte!', ephemeral: true });
            }

            const modal = new ModalBuilder().setCustomId('modal_solicitar_id').setTitle('Registro de ID - Gueto RP');
            const nickInput = new TextInputBuilder().setCustomId('nick_roblox').setLabel('Qual seu nick do roblox?').setStyle(TextInputStyle.Short).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(nickInput));
            await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId === 'modal_solicitar_id') {
            await interaction.deferReply({ ephemeral: true });
            const nickRoblox = interaction.fields.getTextInputValue('nick_roblox');
            const idGerado = gerarProximoID();
            const novoApelido = `${idGerado} | ${nickRoblox}`;
            const membro = interaction.member;

            try { await membro.setNickname(novoApelido); } catch (err) {}
            try {
                if (CONFIG.CARGO_COM_ID !== '123456789012345678') {
                    const cargoId = interaction.guild.roles.cache.get(CONFIG.CARGO_COM_ID);
                    if (cargoId) await membro.roles.add(cargoId);
                }
            } catch (err) {}

            const embedLog = new EmbedBuilder()
                .setTitle('🧱 GUETO RP • Registro de Identidade')
                .setDescription(
                    `Olá **${interaction.user.username}**, sua identidade foi vinculada com sucesso!\n\n` +
                    `📌 **STATUS:** \`ID EMITIDO / AGUARDANDO WHITELIST\`\n\n` +
                    `┃ **NÚMERO DE ID:** #${idGerado}\n` +
                    `┃ **NICK DO ROBLOX:** ${nickRoblox}\n` +
                    `┃ **APELIDO SINCRO:** ${novoApelido}\n\n` +
                    `✅ **Verificações ativas:** Banco de dados integrado, trava anti-duplicação.\n` +
                    `*GUETO RP — Identity Logs*`
                )
                .setColor('#2f3136');

            const canalLog = interaction.guild.channels.cache.get(CONFIG.CANAL_LOG_ID);
            if (canalLog && CONFIG.CANAL_LOG_ID !== '123456789012345678') {
                await canalLog.send({ embeds: [embedLog] });
            }

            await interaction.editReply({ content: `✅ **Sucesso!** ID **#${idGerado}** gerado.` });
        }
    }
};
