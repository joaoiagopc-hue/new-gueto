const { PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    async handleInteraction(interaction) {
        
        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
        // ⚙️ AS ÚNICAS 3 LINHAS DE CONFIGURAÇÃO DO TICKET (GUETO RP)
        // Substitua apenas estes 3 IDs abaixo e não mexa em mais nada!
        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
        const CATEGORIA_TICKET_ID = '1515730442714611832'; // 1. Categoria onde abrem os tickets
        const CARGO_STAFF_ID      = '1515730228528418956'; // 2. Cargo da Staff que atende
        const CANAL_LOGS_TICKETS  = '1530263063436202024'; // 3. Sala de logs e estrelas da Staff
        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
        
        const icone = interaction.guild.iconURL({ dynamic: true });

        if (!interaction.client.dadosTickets) interaction.client.dadosTickets = new Map();
        if (!interaction.client.staffTickets) interaction.client.staffTickets = new Map();

        if (interaction.customId === 'abrir_ticket_suporte' || interaction.customId === 'abrir_ticket_denuncia') {
            await interaction.deferReply({ ephemeral: true });
            const tipo = interaction.customId === 'abrir_ticket_suporte' ? 'suporte' : 'denúncia';
            
            const canal = await interaction.guild.channels.create({
                name: `${tipo}-${interaction.user.username}`.toLowerCase(),
                type: 0,
                parent: CATEGORIA_TICKET_ID !== '123456789012345678' ? CATEGORIA_TICKET_ID : null,
                permissionOverwrites: [
                    { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                    ...(CARGO_STAFF_ID !== '123456789012345678' ? [{ id: CARGO_STAFF_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }] : [])
                ],
            });

            const embed = new EmbedBuilder()
                .setTitle(`🎫 ATENDIMENTO — ${tipo.toUpperCase()}`)
                .setDescription(`Olá ${interaction.user}, relate seu problema.\n\n🙋‍♂️ **Assumir:** Staff assume.\n📜 **Logs:** Salva texto.\n🔒 **Fechar:** Encerra canal.`)
                .setColor('#2f3136')
                .setTimestamp();

            const bt = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('assumir_ticket').setLabel('Assumir Ticket 🙋‍♂️').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('salvar_logs_ticket').setLabel('Salvar Logs 📜').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('fechar_ticket_tentativa').setLabel('Fechar Atendimento 🔒').setStyle(ButtonStyle.Danger)
            );
            
            await canal.send({ content: `${interaction.user} | ${CARGO_STAFF_ID !== '123456789012345678' ? `<@&${CARGO_STAFF_ID}>` : '@Staff'} 🔔`, embeds: [embed], components: [bt] });
            await interaction.editReply({ content: `✅ Canal aberto: ${canal}` });
        }

        if (interaction.customId === 'assumir_ticket') {
            if (CARGO_STAFF_ID !== '123456789012345678' && !interaction.member.roles.cache.has(CARGO_STAFF_ID)) {
                return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
            }
            if (interaction.client.staffTickets.has(interaction.channel.id)) {
                return interaction.reply({ content: '❌ Já assumido!', ephemeral: true });
            }
            interaction.client.staffTickets.set(interaction.channel.id, interaction.user.id);
            const nEmbed = EmbedBuilder.from(interaction.message.embeds).setDescription(interaction.message.embeds.description + `\n\n📌 **RESPONSÁVEL ATUAL:** ${interaction.user}`);
            await interaction.update({ embeds: [nEmbed] });
        }

        if (interaction.customId === 'salvar_logs_ticket') {
            await interaction.reply({ content: '🔄 Extraindo...', ephemeral: true });
            const msg = await interaction.channel.messages.fetch({ limit: 100 });
            let txt = msg.reverse().map(m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`).join('\n');
            const cLogs = interaction.guild.channels.cache.get(CANAL_LOGS_TICKETS);
            if (cLogs && CANAL_LOGS_TICKETS !== '123456789012345678') {
                await cLogs.send({ files: [{ attachment: Buffer.from(txt, 'utf-8'), name: `log-${interaction.channel.name}.txt` }] });
            }
            await interaction.followUp({ content: '✅ Salvo!', ephemeral: true });
        }

        if (interaction.customId === 'fechar_ticket_tentativa') {
            if (!interaction.client.staffTickets.has(interaction.channel.id)) {
                return interaction.reply({ content: '❌ O ticket precisa ser assumido antes!', ephemeral: true });
            }
            const modal = new ModalBuilder().setCustomId('modal_motivo_fechamento').setTitle('Fechar Atendimento');
            modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('input_motivo_texto').setLabel('Motivo do fechamento?').setStyle(TextInputStyle.Paragraph).setRequired(true)));
            await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId === 'modal_motivo_fechamento') {
            await interaction.deferReply();
            const motivo = interaction.fields.getTextInputValue('input_motivo_texto');
            const staffIDMestre = interaction.client.staffTickets.get(interaction.channel.id) || interaction.user.id;

            const embedAvaliar = new EmbedBuilder()
                .setTitle('⭐ AVALIAÇÃO DE ATENDIMENTO | GUETO RP ⭐')
                .setDescription(`O seu chamado foi encerrado pela nossa equipe administrativa.\n\n📌 **Motivo do Fechamento:** \`${motivo}\`\n👤 **Atendente:** <@${staffIDMestre}>\n\nPor favor, utilize os botões abaixo para avaliar a qualidade do suporte recebido de **1 a 5 estrelas**! O canal será excluído após o seu voto.`)
                .setColor('#2f3136')
                .setTimestamp();

            interaction.client.dadosTickets.set(interaction.channel.id, { motivo: motivo, staffID: staffIDMestre });

            const btsEstrelas = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('voto_1').setLabel('1 ⭐').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('voto_2').setLabel('2 ⭐').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('voto_3').setLabel('3 ⭐').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('voto_4').setLabel('4 ⭐').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('voto_5').setLabel('5 ⭐').setStyle(ButtonStyle.Primary)
            );

            await interaction.editReply({ content: '🔒 Atendimento finalizado. Aguardando a avaliação do cidadão...', embeds: [embedAvaliar], components: [btsEstrelas] });
        }

        if (interaction.isButton() && interaction.customId.startsWith('voto_')) {
            await interaction.deferUpdate();
            const notaEstrelas = parseInt(interaction.customId.replace('voto_', ''), 10) || 5;
            let motivoOriginal = 'Não informado';
            let idStaffAtendente = interaction.user.id;

            if (interaction.client.dadosTickets.has(interaction.channel.id)) {
                const dadosGuardados = interaction.client.dadosTickets.get(interaction.channel.id);
                motivoOriginal = dadosGuardados.motivo;
                idStaffAtendente = dadosGuardados.staffID;
                interaction.client.dadosTickets.delete(interaction.channel.id);
                interaction.client.staffTickets.delete(interaction.channel.id);
            }

            const embedLogFinal = new EmbedBuilder()
                .setTitle('🟥 CHAMADO ENCERRADO E AVALIADO')
                .setColor('#2f3136')
                .addFields([
                    { name: '🎫 Canal Suportado', value: `#${interaction.channel.name}`, inline: true },
                    { name: '👤 Cidadão Solicitante', value: `${interaction.user}`, inline: true },
                    { name: '👮 Staff Atendente', value: `<@${idStaffAtendente}>`, inline: true },
                    { name: '📊 Nota do Suporte', value: `\`\`\`fix\n${'⭐'.repeat(notaEstrelas)} (${notaEstrelas}/5 Estrelas)\n\`\`\``, inline: false },
                    { name: '📌 Motivo de Encerramento', value: `\`\`\`md\n> ${motivoOriginal}\n\`\`\``, inline: false }
                ])
                .setTimestamp();

            const cLogs = interaction.guild.channels.cache.get(CANAL_LOGS_TICKETS);
            if (cLogs && CANAL_LOGS_TICKETS !== '123456789012345678') {
                await cLogs.send({ embeds: [embedLogFinal] }).catch(() => null);
                const mensagensFinais = await interaction.channel.messages.fetch({ limit: 100 });
                let txtFinal = mensagensFinais.reverse().map(m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`).join('\n');
                await cLogs.send({ files: [{ attachment: Buffer.from(txtFinal, 'utf-8'), name: `final-log-${interaction.channel.name}.txt` }] }).catch(() => null);
            }

            await interaction.editReply({ content: `✅ **Obrigado!** Sorteado \`${notaEstrelas}/5 estrelas\`. Canal deletando...`, embeds: [], components: [] });
            setTimeout(() => interaction.channel.delete().catch(() => null), 5000);
        }
    }
};
