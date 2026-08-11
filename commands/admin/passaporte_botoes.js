const { EmbedBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Sistema de arquivo de texto original que guarda a contagem sequencial dos IDs
const idFilePath = path.join(__dirname, '../../proximo_id.txt');

module.exports = {
    // 🚨 EXPORTAÇÃO DUPLA DE SEGURANÇA: Alinha perfeitamente com qualquer chamada do seu index.js
    handleInteraction: async function(interaction) { return await module.exports.processarFluxoId(interaction); },
    handleInteractions: async function(interaction) { return await module.exports.processarFluxoId(interaction); },

    async processarFluxoId(interaction) {
        
        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
        // ⚙️ AS SUAS CONFIGURAÇÕES EXATAS DE CARGOS E CANAIS DO SEU DISCORD
        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
        const CONFIG = {
            CARGO_COM_ID: '1529945344241176738', // Cargo com ID que libera o canal da WL
            CANAL_LOG_ID: '1529891192224088326' // Canal onde vai a mensagem pública de Registro
        };
        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

        // 🎫 PASSO 1: O MORADOR CLICA NO BOTÃO DA PREFEITURA
        if (interaction.isButton() && interaction.customId === 'solicitar_id_botao') {
            
            // Travas nativas de segurança idênticas contra duplicados
            const jaPossuiCargo = interaction.member.roles.cache.has(CONFIG.CARGO_COM_ID);
            const jaTemIdNoNick = /^\d+/.test(interaction.member.displayName) || interaction.member.displayName.includes('|');

            if (jaPossuiCargo || jaTemIdNoNick) {
                return interaction.reply({ 
                    content: '❌ **Ação Negada:** Você já possui un número de ID registrado ou vinculado a este passaporte!', 
                    ephemeral: true 
                });
            }

            // 🚨 POPUP DO NICK: Cria o Modal Popup para perguntar o Nick do Roblox na tela!
            const modalRoblox = new ModalBuilder()
                .setCustomId('modal_formulario_passaporte_roblox')
                .setTitle('🪪 Registro de Passaporte Civil');

            const campoNick = new TextInputBuilder()
                .setCustomId('input_nick_roblox_morador')
                .setLabel('Digite o seu Nick oficial do Roblox:')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Ex: Pedrothboy / Lady_duda7')
                .setMinLength(3)
                .setMaxLength(20)
                .setRequired(true);

            modalRoblox.addComponents(new ActionRowBuilder().addComponents(campoNick));
            return interaction.showModal(modalRoblox);
        }

        // 🎫 PASSO 2: O MORADOR ENVIA O FORMULÁRIO COM O NICK DIGITADO
        if (interaction.isModalSubmit() && interaction.customId === 'modal_formulario_passaporte_roblox') {
            
            const nickRobloxDigitado = interaction.fields.getTextInputValue('input_nick_roblox_morador');

            // 🚨 ENGINE DO ARQUIVO .TXT CALIBRADA PARA O ID 331:
            if (!fs.existsSync(idFilePath)) {
                fs.writeFileSync(idFilePath, '331', 'utf8'); // Garante a largada mestre na série 331 de fábrica
            }

            let proximoId = parseInt(fs.readFileSync(idFilePath, 'utf8'), 10);
            
            // Trava de segurança: Se o arquivo estiver limpo ou menor que 331, força ser 331
            if (isNaN(proximoId) || proximoId < 331) {
                proximoId = 331;
            }

            const idCidadaoDefinitivo = proximoId;

            // Avança o contador do arquivo txt adicionando +1 para o próximo (Ex: 331 + 1 = 332)
            const atualizarProximoTxt = idCidadaoDefinitivo + 1;
            fs.writeFileSync(idFilePath, atualizarProximoTxt.toString(), 'utf8');

            const membroAlvo = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);

            if (membroAlvo) {
                // 🛠️ 1. APELIDO SINCRO NO PADRÃO EXATO QUE VOCÊ PEDIU: "ID | USER"
                try {
                    await membroAlvo.setNickname(`${idCidadaoDefinitivo} | ${nickRobloxDigitado}`);
                } catch (error) {
                    console.log('⚠️ Aviso: Sem permissões de cargo superior para alterar o apelido.');
                }

                // 🏅 2. ADIÇÃO DE CARGO AUTOMÁTICA: Libera o acesso para o canal da White-list!
                try {
                    await membroAlvo.roles.add(CONFIG.CARGO_COM_ID);
                } catch (error) {
                    console.log('❌ Erro crítico: O cargo do bot precisa estar acima do cargo do morador na lista.');
                }
            }

            // 🟥 3. MENSAGEM ESTÉTICA DE LOG PÚBLICA ENVIADA NO CANAL DA PREFEITURA
            try {
                const canalLogsPublicos = await interaction.guild.channels.fetch(CONFIG.CANAL_LOG_ID);
                
                const embedLogRegistro = new EmbedBuilder()
                    .setTitle('🧱 GUETO RP • Registro de Identidade')
                    .setDescription(`Olá **${interaction.user.username}**, sua identidade foi vinculada com sucesso!`)
                    .addFields(
                        { name: '📌 STATUS', value: '```🟥 ID EMITIDO / AGUARDANDO WHITELIST```', inline: false },
                        { name: '┃ NÚMERO DE ID', value: `\`#${idCidadaoDefinitivo}\``, inline: true },
                        { name: '┃ NICK DO ROBLOX', value: `\`${nickRobloxDigitado}\``, inline: true },
                        { name: '┃ APELIDO SINCRO', value: `\`${idCidadaoDefinitivo} | ${nickRobloxDigitado}\``, inline: false },
                        { name: '✅ Verificações ativas', value: '```Banco de dados integrado, trava anti-duplicação, cargo automático.```', inline: false }
                    )
                    .setColor('#2f3136')
                    .setFooter({ text: 'GUETO RP — Identity Logs' })
                    .setTimestamp();

                await canalLogsPublicos.send({ content: `${interaction.user}`, embeds: [embedLogRegistro] });
            } catch (e) {
                console.log('⚠️ Canal de logs de passaporte inválido ou sem permissão de escrita.');
            }

            // Responde o morador na tela confirmando que o documento foi gerado
            return interaction.reply({
                content: `✅ **Passaporte Emitido!** Sua identidade foi vinculada com sucesso.\n┃ 🆔 **Seu ID Civil:** \`#${idCidadaoDefinitivo}\` (Série 331)\n┃ 🧑 **Nome Formatado:** \`${idCidadaoDefinitivo} | ${nickRobloxDigitado}\`\n┃ 🏅 O seu cargo foi entregue e a sala da White-List já está aberta para você!`,
                ephemeral: true
            });
        }
    }
};
