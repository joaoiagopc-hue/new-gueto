const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const idFilePath = path.join(__dirname, '../../proximo_id.txt');

function gerarProximoID() {
    if (!fs.existsSync(idFilePath)) fs.writeFileSync(idFilePath, '925');
    const idAtual = parseInt(fs.readFileSync(idFilePath, 'utf8'), 10);
    fs.writeFileSync(idFilePath, (idAtual + 1).toString());
    return idAtual;
}

module.exports = {
    async handleInteraction(interaction) {
        // ⚙️ ADICIONE OS IDs DO SEU SERVER NAS LINHAS ABAIXO:
        const CONFIG = { 
            CARGO_COM_ID: '1529945344241176738', 
            CANAL_LOG_ID: '1529891192224088326' 
        };

        if (interaction.customId === 'solicitar_id_botao') {
            const modal = new ModalBuilder().setCustomId('modal_solicitar_id').setTitle('Registro de ID - Gueto RP');
            const nickInput = new TextInputBuilder().setCustomId('nick_roblox').setLabel('Qual seu nick do roblox?').setStyle(TextInputStyle.Short).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(nickInput));
            return interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId === 'modal_solicitar_id') {
            await interaction.deferReply({ ephemeral: true });
            const nickRoblox = interaction.fields.getTextInputValue('nick_roblox');
            const idGerado = gerarProximoID();
            const novoApelido = `${idGerado} | ${nickRoblox}`;

            try { await interaction.member.setNickname(novoApelido); } catch (e) {}
            try {
                const cargo = interaction.guild.roles.cache.get(CONFIG.CARGO_COM_ID);
                if (cargo) await interaction.member.roles.add(cargo);
            } catch (e) {}

            const log = new EmbedBuilder().setTitle('🆔 REGISTRO CIVIL').setDescription(`Usuário **${interaction.user.username}** gerou o passaporte.`).setColor('#0000ff').addFields([{ name: '🪪 ID', value: `#${idGerado}` }, { name: '👤 Nick', value: nickRoblox }]).setTimestamp();
            const canal = interaction.guild.channels.cache.get(CONFIG.CANAL_LOG_ID);
            if (canal) await canal.send({ embeds: [log] });

            await interaction.editReply({ content: `✅ Sucesso! Seu ID é o **#${idGerado}**.` });
        }
    }
};
