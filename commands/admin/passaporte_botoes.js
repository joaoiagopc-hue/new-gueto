const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const idFilePath = path.join(__dirname, '../../proximo_id.txt');

function gerarProximoID() {
    // 🚨 CONFIGURAÇÃO DE SEGURANÇA: Define o ID inicial da cidade como 10
    if (!fs.existsSync(idFilePath)) {
        fs.writeFileSync(idFilePath, '10');
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

        // 1. CLICOU NO BOTÃO "SOLICITAR ID" -> ABRE O POPUP FORMULÁRIO (MODAL)
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

        // 2. ENVIOU O POPUP -> PROCESSA NICK, CARGO E GERA ID SEQUENCIAL
        if (interaction.isModalSubmit() && interaction.customId === 'modal_solicitar_id') {
            await interaction.deferReply({ ephemeral: true });

            const nickRoblox = interaction.fields.getTextInputValue('nick_roblox');
            const idGerado = gerarProximoID();
            const novoApelido = `${idGerado} | ${nickRoblox}`;

            const membro = interaction.member;
            const userAntes = interaction.user.username;

            // Altera o apelido do jogador no servidor automaticamente
            try {
                await membro.setNickname(novoApelido);
            } catch (err) { 
                console.log('Aviso: Falha ao alterar nick:', err); 
            }

            // Entrega o cargo "Com ID" para liberar o acesso ao canal de Whitelist
            try {
                if (CONFIG.CARGO_COM_ID !== '123456789012345678') {
                    const cargoId = interaction.guild.roles.cache.get(CONFIG.CARGO_COM_ID);
                    if (cargoId) await membro.roles.add(cargoId);
                }
            } catch (err) { 
                console.log('Erro ao tentar adicionar o cargo de ID:', err); 
            }

            // Monta o relatório de registro civil na cor azul oficial do Gueto
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

            // Despacha o comprovante azul para a sala de logs da Staff
            const canalLog = interaction.guild.channels.cache.get(CONFIG.CANAL_LOG_ID);
            if (canalLog && CONFIG.CANAL_LOG_ID !== '123456789012345678') {
                await canalLog.send({ embeds: [embedLog] });
            }

            // Envia uma cópia do comprovante direto na DM do morador por segurança
            try {
                await interaction.user.send({
                    content: `🎉 **ID GERADO COM SUCESSO!**\n\nSeu registro oficial no **Gueto RP** é o número: \`#${idGerado}\`!\n\n➡️ **PRÓXIMO PASSO:**\nAgora que você possui uma identidade vinculada, utilize o comando de barra \`/painel-wl\` para realizar o seu teste e liberar o acesso total ao Brookhaven!`
                });
            } catch (err) { 
                console.log('Aviso: DM fechada.'); 
            }

            // Retorna a resposta oculta para o jogador confirmando a operação
            await interaction.editReply({ content: `✅ **Sucesso absoluto!** O seu registro civil de ID **#${idGerado}** foi gerado e salvo em nosso banco de dados.` });
        }
    }
};
