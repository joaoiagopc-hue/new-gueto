const { PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    async handleInteraction(interaction) {
        // CONFIGURAÇÕES DO ATENDIMENTO (Insira os IDs numéricos reais do seu Discord)
        const CONFIG = {
            CATEGORIA_TICKET_ID: '1515730442714611832', 
            CARGO_STAFF_ID: '1515730228528418956',
            CANAL_LOGS_TICKETS: '1530263063436202024' 
        };

        const iconeServidor = interaction.guild.iconURL({ dynamic: true });

        // 1. CRIAÇÃO DO ATENDIMENTO PRIVADO
        if (interaction.customId === 'abrir_ticket_suporte' || interaction.customId === 'abrir_ticket_denuncia') {
            await interaction.deferReply({ ephemeral: true });

            const tipo = interaction.customId === 'abrir_ticket_suporte' ? 'suporte' : 'denúncia';
            const nomeCanal = `${tipo}-${interaction.user.username}`.toLowerCase();

            const canalTicket = await interaction.guild.channels.create({
                name: nomeCanal,
                type: 0, 
                parent: CONFIG.CATEGORIA_TICKET_ID,
                permissionOverwrites: [
                    { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                    { id: CONFIG.CARGO_STAFF_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
                ],
            });

            const embedTicket = new EmbedBuilder()
                .setTitle(`🎫 ATENDIMENTO INICIADO — CATEGORIA: ${tipo.toUpperCase()}`)
                .setDescription(
                    `Olá ${interaction.user}, seja bem-vindo ao seu ticket privado.\n\n` +
                    `Por favor, digite detalhadamente o motivo do seu contato e anexe fotos ou vídeos caso possua provas.\n\n` +
                    `⚙️ **PAINEL DE GERENCIAMENTO (STAFF):**\n` +
                    `• **Assumir Ticket 🙋‍♂️:** Registra você como o responsável pelo atendimento.\n` +
                    `• **Salvar Logs 📜:** Envia o histórico da conversa para a sala de arquivos.\n` +
                    `• **Fechar Atendimento 🔒:** Encerra e abre o formulário de motivo do canal.`
                )
                .setColor('#0000ff') // Azul Oficial
                .setThumbnail(iconeServidor)
                .setFooter({ text: 'Gueto RP • Painel de Controle Administrativo', iconURL: iconeServidor })
                .setTimestamp();

            const botoesControle = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('assumir_ticket').setLabel('Assumir Ticket 🙋‍♂️').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('salvar_logs_ticket').setLabel('Salvar Logs 📜').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('fechar_ticket_tentativa').setLabel('Fechar Atendimento 🔒').setStyle(ButtonStyle.Danger)
            );

            await canalTicket.send({ content: `${interaction.user} | <@&${CONFIG.CARGO_STAFF_ID}>`, embeds: [embedTicket], components: [botoesControle] });
            await interaction.editReply({ content: `✅ Seu ticket foi estruturado! Acesse-o no canal correspondente: ${canalTicket}` });

            const canalLogsGeral = interaction.guild.channels.cache.get(CONFIG.CANAL_LOGS_TICKETS);
            if (canalLogsGeral) {
                canalLogsGeral.send({ content: `🟩 **Ticket Aberto:** O usuário ${interaction.user.tag} abriu o canal \`#${nomeCanal}\`.` });
            }
        }

        // 2. AÇÃO DE ASSUMIR O ATENDIMENTO
        if (interaction.customId === 'assumir_ticket') {
            if (!interaction.member.roles.cache.has(CONFIG.CARGO_STAFF_ID)) {
                return interaction.reply({ content: '❌ Apenas membros da equipe de Staff podem assumir atendimentos!', ephemeral: true });
            }

            const embedOriginal = interaction.message.embeds;
            if (embedOriginal.description.includes('RESPONSÁVEL ATUAL:')) {
                return interaction.reply({ content: '❌ Este ticket já foi assumido por outro membro da equipe!', ephemeral: true });
            }

            const novaEmbed = EmbedBuilder.from(embedOriginal)
                .setDescription(embedOriginal.description + `\n\n📌 **RESPONSÁVEL ATUAL:** ${interaction.user} assumiu este ticket.`);

            await interaction.update({ embeds: [novaEmbed] });
            await interaction.channel.send({ content: `🙋‍♂️ **Suporte:** Este ticket agora está sendo cuidado e analisado por ${interaction.user}.` });
        }

        // 3. AÇÃO DE SALVAR O HISTÓRICO DE MENSAGENS (LOGS)
        if (interaction.customId === 'salvar_logs_ticket') {
            if (!interaction.member.roles.cache.has(CONFIG.CARGO_STAFF_ID)) {
                return interaction.reply({ content: '❌ Permissão negada.', ephemeral: true });
            }

            await interaction.reply({ content: '🔄 Compilando mensagens e gerando arquivo de transcrição...', ephemeral: true });

            const mensagens = await interaction.channel.messages.fetch({ limit: 100 });
            let textoLog = `HISTÓRICO DO TICKET: ${interaction.channel.name}\n\n`;

            mensagens.reverse().forEach(msg => {
                textoLog += `[${msg.createdAt.toLocaleString()}] ${msg.author.tag}: ${msg.content}\n`;
            });

            const buffer = Buffer.from(textoLog, 'utf-8');
            const canalLogsGeral = interaction.guild.channels.cache.get(CONFIG.CANAL_LOGS_TICKETS);
            
            if (canalLogsGeral) {
                await canalLogsGeral.send({
                    content: `📜 **Logs de Conversa:** Canal \`#${interaction.channel.name}\` arquivado por ${interaction.user}.`,
                    files: [{ attachment: buffer, name: `log-${interaction.channel.name}.txt` }]
                });
                await interaction.followUp({ content: '✅ Histórico salvo com sucesso no canal de logs da Staff!', ephemeral: true });
            } else {
                await interaction.followUp({ content: '❌ Erro: Canal de logs não configurado corretamente.', ephemeral: true });
            }
        }

        // 4. CLICOU EM FECHAR -> ABRE O FORMULÁRIO POPUP (MODAL)
        if (interaction.customId === 'fechar_ticket_tentativa') {
            if (!interaction.member.roles.cache.has(CONFIG.CARGO_STAFF_ID)) {
                return interaction.reply({ content: '❌ Apenas a Staff pode fechar um atendimento!', ephemeral: true });
            }

            const mensagensNoCanal = await interaction.channel.messages.fetch({ limit: 50 });
            const foiAssumido = mensagensNoCanal.some(m => m.content && m.content.includes('Este ticket agora está sendo cuidado e analisado por'));

            if (!foiAssumido) {
                return interaction.reply({ 
                    content: '❌ **Bloqueado:** Este ticket não pode ser fechado ainda porque nenhum membro da Staff clicou em **"Assumir Ticket"** para atender o cidadão!', 
                    ephemeral: true 
                });
            }

            const modalFechar = new ModalBuilder()
                .setCustomId('modal_motivo_fechamento')
                .setTitle('Encerramento de Atendimento');

            const motivoInput = new TextInputBuilder()
                .setCustomId('input_motivo_texto')
                .setLabel('Qual o motivo do fechamento?')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Ex: Caso resolvido no jogo / Jogador sem resposta no chat')
                .setRequired(true);

            modalFechar.addComponents(new ActionRowBuilder().addComponents(motivoInput));
            await interaction.showModal(modalFechar);
        }

        // 5. RECEBE O MOTIVO PREENCHIDO, MANDA OS LOGS AZUIS E DELETA O CANAL
        if (interaction.isModalSubmit() && interaction.customId === 'modal_motivo_fechamento') {
            await interaction.deferReply();

            const motivoInformado = interaction.fields.getTextInputValue('input_motivo_texto');

            await interaction.editReply({ content: `🔒 **Ticket Finalizado.** Motivo registrado. Este canal será completamente deletado em 5 segundos...` });

            const canalLogsGeral = interaction.guild.channels.cache.get(CONFIG.CANAL_LOGS_TICKETS);
            if (canalLogsGeral) {
                const embedFinalLog = new EmbedBuilder()
                    .setTitle('🟥 TICKET ENCERRADO E ARQUIVADO')
                    .setColor('#0000ff') // Azul Oficial
                    .addFields([
                        { name: '🎫 Canal Deletado', value: `#${interaction.channel.name}`, inline: true },
                        { name: '👤 Finalizado Por', value: `${interaction.user}`, inline: true },
                        { name: '📌 Motivo Informado', value: `${motivoInformado}`, inline: false }
                    ])
                    .setTimestamp();

                await canalLogsGeral.send({ embeds: [embedFinalLog] });
            }

            setTimeout(async () => {
                try {
                    await interaction.channel.delete();
                } catch (err) { console.log(err); }
            }, 5000);
        }
    }
};
