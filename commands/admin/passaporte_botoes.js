const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const idFilePath = path.join(__dirname, '../../proximo_id.txt');

function gerarProximoID() {
    if (!fs.existsSync(idFilePath)) {
        fs.writeFileSync(idFilePath, '1001');
    }
    const idAtual = parseInt(fs.readFileSync(idFilePath, 'utf8'), 10);
    const proximoId = idAtual + 1;
    fs.writeFileSync(idFilePath, proximoId.toString());
    return idAtual;
}

module.exports = {
    async handleInteraction(interaction) {
        // CONFIGURAÇÕES DO ID (Substitua pelos IDs reais do seu novo servidor)
        const CONFIG = {
            CARGO_COM_ID: '1529945344241176738', 
            CANAL_LOG_ID: '1529891192224088326'
        };

        if (interaction.customId === 'solicitar_id_botao') {
            const modal = new ModalBuilder()
                .setCustomId('modal_solicitar_id')
                .setTitle('Registro de ID - Gueto RP');

            const nickInput = new TextInputBuilder()
                .setCustomId('nick_roblox')
                .setLabel('Qual seu nick do roblox?')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Digite seu nick exatamente como está no Roblox')
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(nickInput));
            await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId === 'modal_solicitar_id') {
            await interaction.deferReply({ ephemeral: true });

            const nickRoblox = interaction.fields.getTextInputValue('nick_roblox');
            const idGerado = gerarProximoID();
            const novoApelido = `${idGerado} | ${nickRoblox}`;

            const membro = interaction.member;
            const userAntes = interaction.user.username;

            try {
                await membro.setNickname(novoApelido);
            } catch (err) { console.log('Erro ao alterar nick:', err); }

            try {
                const cargoId = interaction.guild.roles.cache.get(CONFIG.CARGO_COM_ID);
                if (cargoId) await membro.roles.add(cargoId);
            } catch (err) { console.log('Erro ao adicionar cargo novo:', err); }

            const embedLog = new EmbedBuilder()
                .setTitle('🆔 ✨ NOVO REGISTRO DE IDENTIDADE ✨ 🆔')
                .setDescription(`Olá **${userAntes}**, sua identidade foi vinculada com sucesso no Gueto!\n\n📌 **STATUS:** \`ID EMITIDO / AGUARDANDO WHITELIST\``)
                .setColor('#0000ff') // Azul Oficial
                .addFields(
                    { name: '🪪 NÚMERO DE ID', value: `\`\`\`fix\n#${idGerado}\n\`\`\``, inline: false },
                    { name: '👤 NICK DO ROBLOX', value: `\`\`\`yaml\n${nickRoblox}\n\`\`\``, inline: true },
                    { name: '🏷️ APELIDO ATUALIZADO', value: `\`\`\`md\n> ${novoApelido}\n\`\`\``, inline: true }
                )
                .setTimestamp();

            const canalLog = interaction.guild.channels.cache.get(CONFIG.CANAL_LOG_ID);
            if (canalLog) await canalLog.send({ embeds: [embedLog] });

            try {
                await interaction.user.send({
                    content: `🎉 **ID GERADO!**\n\nSeu ID oficial no **Gueto RP** é: \`#${idGerado}\`!\n\n➡️ **PRÓXIMO PASSO:**\nAgora que você possui um ID, vá até o canal de Whitelist e responda o teste para receber seu cargo definitivo de Cidadão!`
                });
            } catch (err) { console.log('DM fechada.'); }

            await interaction.editReply({ content: `✅ **Sucesso!** ID **#${idGerado}** gerado com sucesso.` });
        }
    }
};
