const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const idFilePath = path.join(__dirname, '../../proximo_id.txt');

function gerarProximoID() {
    // 🚨 CONFIGURAÇÃO DE SEGURANÇA: Define o ID inicial da cidade como 20
    if (!fs.existsSync(idFilePath)) {
        fs.writeFileSync(idFilePath, '20');
    }
    const idAtual = parseInt(fs.readFileSync(idFilePath, 'utf8'), 10);
    const proximoId = idAtual + 1;
    fs.writeFileSync(idFilePath, proximoId.toString());
    return idAtual;
}

module.exports = {
    async handleInteraction(interaction) {
        
        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
        // ⚙️ CENTRAL DE CONFIGURAÇÃO DO PASSAPORTE / IDENTIDADE
        // Substitua os números abaixo pelos IDs reais do seu Discord!
        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
        const CONFIG = {
         CARGO_COM_ID: '1529945344241176738', 
            CANAL_LOG_ID: '1529891192224088326'   // ID da sala de logs de identidade
        };
        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

        // 1. CLICOU NO BOTÃO "SOLICITAR ID"
        if (interaction.customId === 'solicitar_id_botao') {
            
            // 🚨 TRAVA DE SEGURANÇA: Verifica se o morador já tem o cargo ou se o nick já inicia com números
            const jaPossuiCargo = interaction.member.roles.cache.has(CONFIG.CARGO_COM_ID);
            const jaTemIdNoNick = /^\d+/.test(interaction.member.displayName);

            if (jaPossuiCargo || jaTemIdNoNick) {
                return interaction.reply({
                    content: '⚠️ **Bloqueado:** Você já realizou o seu registro civil e possui um número de ID vinculado a este passaporte! Não é permitido solicitar uma nova identidade.',
                    ephemeral: true
                });
            }

            // Se estiver livre, abre o formulário popup (Modal)
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

        // 2. ENVIOU O POPUP FORMULÁRIO
        if (interaction.isModalSubmit() && interaction.customId === 'modal_solicitar_id') {
            await interaction.deferReply({ ephemeral: true });

            const nickRoblox = interaction.fields.getTextInputValue('nick_roblox');
            const idGerado = gerarProximoID();
            const novoApelido = `${idGerado} | ${nickRoblox}`;

            const membro = interaction.member;
            const userAntes = interaction.user.username;

            try {
                await membro.setNickname(novoApelido);
            } catch (err) { 
                console.log('Aviso: Falha ao alterar nick:', err); 
            }

            try {
                if (CONFIG.CARGO_COM_ID !== '123456789012345678') {
                    const cargoId = interaction.guild.roles.cache.get(CONFIG.CARGO_COM_ID);
                    if (cargoId) await membro.roles.add(cargoId);
                }
            } catch (err) { 
                console.log('Erro ao tentar adicionar o cargo de ID:', err); 
            }

            const embedLog = new EmbedBuilder()
                .setTitle('🆔 ✨ NOVO REGISTRO DE IDENTIDADE ✨ 🆔')
                .setDescription(`Olá **${userAntes}**, sua identidade foi vinculada com sucesso no Gueto!\n\n📌 **STATUS:** \`ID EMITIDO / AGUARDANDO WHITELIST\``)
                .setColor('#0000ff') // Azul Oficial Gueto RP
                .addFields([
                    { name: '🪪 NÚMERO DE ID', value: `\`\`\`fix\n#${idGerado}\n\`\`\``, inline: false },
                    { name: '👤 NICK DO ROBLOX', value: `\`\`\`yaml\n${nickRoblox}\n\`\`\``, inline: true },
                    { name: '🏷️ APELIDO ATUALIZADO', value: `\`\`\`md\n> ${novoApelido}\n\`\`\``, inline: true }
                ])
                .setTimestamp();

            const canalLog = interaction.guild.channels.cache.get(CONFIG.CANAL_LOG_ID);
            if (canalLog && CONFIG.CANAL_LOG_ID !== '123456789012345678') {
                await canalLog.send({ embeds: [embedLog] });
            }

            try {
                await interaction.user.send({
                    content: `🎉 **ID GERADO COM SUCESSO!**\n\nSeu registro oficial no **Gueto RP** é o número: \`#${idGerado}\`!\n\n➡️ **PRÓXIMO PASSO:**\nAgora que você possui uma identidade vinculada, utilize o comando de barra \`/painel-wl\` para realizar o seu teste e liberar o acesso total ao Brookhaven!`
                });
            } catch (err) { 
                console.log('Aviso: DM fechada.'); 
            }

            await interaction.editReply({ content: `✅ **Sucesso absoluto!** O seu registro civil de ID **#${idGerado}** foi gerado e salvo em nosso banco de dados.` });
        }
    }
};
