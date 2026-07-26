const { PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    async handleInteraction(interaction) {
        const CONFIG = { 
            CATEGORIA_TICKET_ID: '1515730442714611832', 
            CARGO_STAFF_ID: '1515730228528418956', 
            CANAL_LOGS_TICKETS: '1530263063436202024' 
        };
        const icone = interaction.guild.iconURL({ dynamic: true });

        if (interaction.customId === 'abrir_ticket_suporte' || interaction.customId === 'abrir_ticket_denuncia') {
            await interaction.deferReply({ ephemeral: true });
            const tipo = interaction.customId === 'abrir_ticket_suporte' ? 'suporte' : 'denúncia';
            const canal = await interaction.guild.channels.create({
                name: `${tipo}-${interaction.user.username}`.toLowerCase(),
                type: 0,
                parent: CONFIG.CATEGORIA_TICKET_ID !== '123456789012345678' ? CONFIG.CATEGORIA_TICKET_ID : null,
                permissionOverwrites: [
                    { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                    ...(CONFIG.CARGO_STAFF_ID !== '123456789012345678' ? [{ id: CONFIG.CARGO_STAFF_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }] : [])
                ],
            });

            const embed = new EmbedBuilder().setTitle(`🎫 ATENDIMENTO INICIADO — CATEGORIA: ${tipo.toUpperCase()}`).setDescription(`Olá ${interaction.user}, bem-vindo ao seu ticket.\n\nDigite detalhadamente o motivo do contato.\n\n🙋‍♂️ **Assumir Ticket**\n📜 **Salvar Logs**\n🔒 **Fechar Atendimento**`).setColor('#0000ff').setThumbnail(icone).setTimestamp();
            const bt = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('assumir_ticket').setLabel('Assumir Ticket 🙋‍♂️').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('salvar_logs_ticket').setLabel('Salvar Logs 📜').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('fechar_ticket_tentativa').setLabel('Fechar Atendimento 🔒').setStyle(ButtonStyle.Danger)
            );
            
            const mencaoStaff = CONFIG.CARGO_STAFF_ID !== '123456789012345678' ? `<@&${CONFIG.CARGO_STAFF_ID}>` : '@Staff';
            await canal.send({ content: `${interaction.user} | ${mencaoStaff} 🔔`, embeds: [embed], components: [bt] });
            await interaction.editReply({ content: `✅ Atendimento criado: ${canal}` });
        }

        if (interaction.customId === 'assumir_ticket') {
            if (CONFIG.CARGO_STAFF_ID !== '123456789012345678' && !interaction.member.roles.cache.has(CONFIG.CARGO_STAFF_ID)) return interaction.reply({ content: '❌ Apenas Staff!', ephemeral: true });
            if (interaction.message.embeds[0].description.includes('RESPONSÁVEL ATUAL:')) return interaction.reply({ content: '❌ Já assumido!', ephemeral: true });
            const novaEmbed = EmbedBuilder.from(interaction.message.embeds[0]).setDescription(interaction.message.embeds[0].description + `\n\n📌 **RESPONSÁVEL ATUAL:** ${interaction.user}`);
            await interaction.update({ embeds: [novaEmbed] });
            await interaction.channel.send({ content: `🙋‍♂️ Este ticket agora está sob os cuidados de ${interaction.user}.` });
        }

        if (interaction.customId === 'salvar_logs_ticket') {
            await interaction.reply({ content: '🔄 Compilando mensagens...', ephemeral: true });
            const msg = await interaction.channel.messages.fetch({ limit: 100 });
            let txt = msg.reverse().map(m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`).join('\n');
            const canalLogs = interaction.guild.channels.cache.get(CONFIG.CANAL_LOGS_TICKETS);
            if (canalLogs) await canalLogs.send({ content: `📜 Logs de \`#${interaction.channel.name}\``, files: [{ attachment: Buffer.from(txt, 'utf-8'), name: `log-${interaction.channel.name}.txt` }] });
            await interaction.followUp({ content: '✅ Histórico salvo com sucesso!', ephemeral: true });
        }

        if (interaction.customId === 'fechar_ticket_tentativa') {
            const msgs = await interaction.channel.messages.fetch({ limit: 50 });
            if (!msgs.some(m => m.content.includes('sob os cuidados de'))) return interaction.reply({ content: '❌ Bloqueado! Nenhum staff assumiu o ticket.', ephemeral: true });
            const modal = new ModalBuilder().setCustomId('modal_motivo_fechamento').setTitle('Fechar Atendimento');
            modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('input_motivo_texto').setLabel('Qual o motivo do fechamento?').setStyle(TextInputStyle.Paragraph).setRequired(true)));
            await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId === 'modal_motivo_fechamento') {
            await interaction.deferReply();
            const motivo = interaction.fields.getTextInputValue('input_motivo_texto');
            await interaction.editReply({ content: `🔒 **Ticket Finalizado.** Deletando em 5 segundos...` });
            const canalLogs = interaction.guild.channels.cache.get(CONFIG.CANAL_LOGS_TICKETS);
            if (canalLogs) {
                const logEmbed = new EmbedBuilder().setTitle('🟥 TICKET ENCERRADO').setColor('#0000ff').addFields([{ name: '🎫 Canal', value: `#${interaction.channel.name}`, inline: true }, { name: '👤 Por', value: `${interaction.user}`, inline: true }, { name: '📌 Motivo', value: motivo, inline: false }]).setTimestamp();
                await canalLogs.send({ embeds: [logEmbed] });
            }
            setTimeout(() => interaction.channel.delete().catch(() => null), 5000);
        }
    }
};
