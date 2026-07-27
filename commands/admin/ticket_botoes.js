const { PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    async handleInteraction(interaction) {
        
        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
        // ⚙️ CENTRAL DE CONFIGURAÇÃO DE CARGOS E CANAIS (GUETO RP)
        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
        const CONFIG = {
            CATEGORIA_TICKET_ID: '1515730442714611832', // ID da categoria onde as salas vão abrir
            CARGO_STAFF_ID:      '1515730228528418956', // ID do cargo da Staff que pode ver e assumir
            CANAL_LOGS_TICKETS:  '1530263063436202024'  // ID do canal onde vão os relatórios finais
        };
        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

        const icone = interaction.guild.iconURL({ dynamic: true });

        // 1. AÇÃO: ABERTURA DO TICKET PRIVADO
        if (interaction.customId === 'abrir_ticket_suporte' || interaction.customId === 'abrir_ticket_denuncia') {
            await interaction.deferReply({ ephemeral: true });
            
            const tipo = interaction.customId === 'abrir_ticket_suporte' ? 'suporte' : 'denúncia';
            const nomeCanal = `${tipo}-${interaction.user.username}`.toLowerCase();
            
            const canal = await interaction.guild.channels.create({
                name: nomeCanal,
                type: 0,
                parent: CONFIG.CATEGORIA_TICKET_ID !== '1515730442714611832' ? CONFIG.CATEGORIA_TICKET_ID : null,
                permissionOverwrites: [
                    { 
                        id: interaction.guild.roles.everyone.id, 
                        deny: [PermissionFlagsBits.ViewChannel] 
                    },
                    { 
                        id: interaction.user.id, 
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] 
                    },
                    ...(CONFIG.CARGO_STAFF_ID !== '1515730228528418956' ? [{ 
                        id: CONFIG.CARGO_STAFF_ID, 
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] 
                    }] : [])
                ],
            });

            const embed = new EmbedBuilder()
                .setTitle(`🎫 ATENDIMENTO — ${tipo.toUpperCase()}`)
                .setDescription(
                    `Olá ${interaction.user}, bem-vindo ao seu ticket privado.\n` +
                    `Por favor, relate o seu problema detalhadamente abaixo.\n\n` +
                    `⚙️ **PAINEL DE GERENCIAMENTO (STAFF):**\n` +
                    `• 🙋‍♂️ **Assumir:** Fica registrado como responsável.\n` +
                    `• 📜 **Logs:** Salva o histórico de mensagens.\n` +
                    `• 🔒 **Fechar:** Encerra este canal com formulário.`
                )
                .setColor('#0000ff') // Azul Oficial Gueto RP
                .setThumbnail(icone)
                .setTimestamp();

            const botoes = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('assumir_ticket').setLabel('Assumir Ticket 🙋‍♂️').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('salvar_logs_ticket').setLabel('Salvar Logs 📜').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('fechar_ticket_tentativa').setLabel('Fechar Atendimento 🔒').setStyle(ButtonStyle.Danger)
            );
            
            const mencaoStaff = CONFIG.CARGO_STAFF_ID !== '123456789012345678' ? `<@&${CONFIG.CARGO_STAFF_ID}>` : '@Staff';
            
            await canal.send({ content: `${interaction.user} | ${mencaoStaff} 🔔`, embeds: [embed], components: [botoes] });
            await interaction.editReply({ content: `✅ Canal de suporte gerado com sucesso: ${canal}` });
        }

        // 2. AÇÃO: ASSUMIR O TICKET
        if (interaction.customId === 'assumir_ticket') {
            if (CONFIG.CARGO_STAFF_ID !== '123456789012345678' && !interaction.member.roles.cache.has(CONFIG.CARGO_STAFF_ID)) {
                return interaction.reply({ content: '❌ Apenas membros da Staff podem assumir atendimentos!', ephemeral: true });
            }
            if (interaction.message.embeds[0].description.includes('RESPONSÁVEL ATUAL:')) {
                return interaction.reply({ content: '❌ Este ticket já possui um responsável!', ephemeral: true });
            }
            
            const novaEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                .setDescription(interaction.message.embeds[0].description + `\n\n📌 **RESPONSÁVEL ATUAL:** ${interaction.user}`);
                
            await interaction.update({ embeds: [novaEmbed] });
            await interaction.channel.send({ content: `🙋‍♂️ Este chamado agora está sob os cuidados de ${interaction.user}.` });
        }

        // 3. AÇÃO: SALVAR HISTÓRICO DE LOGS (.TXT)
        if (interaction.customId === 'salvar_logs_ticket') {
            if (CONFIG.CARGO_STAFF_ID !== '123456789012345678' && !interaction.member.roles.cache.has(CONFIG.CARGO_STAFF_ID)) {
                return interaction.reply({ content: '❌ Permissão negada.', ephemeral: true });
            }
            
            await interaction.reply({ content: '🔄 Compilando mensagens e gerando arquivo...', ephemeral: true });
            const msg = await interaction.channel.messages.fetch({ limit: 100 });
            let txt = msg.reverse().map(m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`).join('\n');
            
            const canalLogs = interaction.guild.channels.cache.get(CONFIG.CANAL_LOGS_TICKETS);
            if (canalLogs && CONFIG.CANAL_LOGS_TICKETS !== '123456789012345678') {
                await canalLogs.send({ 
                    content: `📜 Transcrição de mensagens do canal \`#${interaction.channel.name}\``, 
                    files: [{ attachment: Buffer.from(txt, 'utf-8'), name: `log-${interaction.channel.name}.txt` }] 
                });
            }
            await interaction.followUp({ content: '✅ Histórico arquivado com sucesso!', ephemeral: true });
        }

        // 4. AÇÃO: TRAVA DE FECHAMENTO & POPUP MODAL
        if (interaction.customId === 'fechar_ticket_tentativa') {
            if (CONFIG.CARGO_STAFF_ID !== '123456789012345678' && !interaction.member.roles.cache.has(CONFIG.CARGO_STAFF_ID)) {
                return interaction.reply({ content: '❌ Apenas a Staff pode fechar atendimentos!', ephemeral: true });
            }
            
            const msgs = await interaction.channel.messages.fetch({ limit: 50 });
            if (!msgs.some(m => m.content.includes('sob os cuidados de'))) {
                return interaction.reply({ content: '❌ **Bloqueado!** Nenhum Staff assumiu o atendimento deste morador ainda.', ephemeral: true });
            }
            
            const modal = new ModalBuilder().setCustomId('modal_motivo_fechamento').setTitle('Fechar Atendimento');
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('input_motivo_texto')
                        .setLabel('Motivo do fechamento?')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                )
            );
            await interaction.showModal(modal);
        }

        // 5. AÇÃO: PROCESSAR FORMULÁRIO E DELETAR SALA
        if (interaction.isModalSubmit() && interaction.customId === 'modal_motivo_fechamento') {
            await interaction.deferReply();
            const motivo = interaction.fields.getTextInputValue('input_motivo_texto');
            
            await interaction.editReply({ content: `🔒 **Atendimento Concluído.** Removendo canal em 5 segundos...` });
            
            const canalLogs = interaction.guild.channels.cache.get(CONFIG.CANAL_LOGS_TICKETS);
            if (canalLogs && CONFIG.CANAL_LOGS_TICKETS !== '123456789012345678') {
                const logEmbed = new EmbedBuilder()
                    .setTitle('🟥 TICKET ENCERRADO')
                    .setColor('#0000ff')
                    .addFields([
                        { name: '🎫 Canal', value: `#${interaction.channel.name}`, inline: true }, 
                        { name: '👤 Por', value: `${interaction.user}`, inline: true }, 
                        { name: '📌 Motivo', value: motivo, inline: false }
                    ])
                    .setTimestamp();
                await canalLogs.send({ embeds: [logEmbed] });
            }
            setTimeout(() => interaction.channel.delete().catch(() => null), 5000);
        }
    }
};
