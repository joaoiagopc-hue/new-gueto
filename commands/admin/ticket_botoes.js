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

        // 1. CLICOU PARA ABRIR UM TICKET (SUPORTE OU DENÚNCIA)
        if (interaction.customId === 'abrir_ticket_suporte' || interaction.customId === 'abrir_ticket_denuncia') {
            await interaction.deferReply({ ephemeral: true });
            const tipo = interaction.customId === 'abrir_ticket_suporte' ? 'suporte' : 'denúncia';
            
            const canal = await interaction.guild.channels.create({
                name: `${tipo}-${interaction.user.username}`.toLowerCase(),
                type: 0,
                parent: CATEGORIA_TICKET_ID !== '123456789012345678' ? CATEGORIA_TICKET_ID : null,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    },
                    ...(CARGO_STAFF_ID !== '123456789012345678'
                        ? [{
                            id: CARGO_STAFF_ID,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory
                            ]
                        }]
                        : [])
                ],
            });

            const embed = new EmbedBuilder()
                .setTitle(`🎫 ATENDIMENTO — ${tipo.toUpperCase()}`)
                .setDescription(
                    `Olá ${interaction.user}, relate o seu problema detalhadamente para que nossa equipe possa te ajudar.\n\n` +
                    `🙋‍♂️ **Assumir:** Fica responsável pelo chamado.\n` +
                    `📜 **Logs:** Salva o histórico de texto.\n` +
                    `🔒 **Fechar:** Encerra o atendimento e abre a avaliação.`
                )
                .setColor('#0000ff')
                .setThumbnail(icone)
                .setTimestamp();

            const bt = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('assumir_ticket')
                    .setLabel('Assumir Ticket 🙋‍♂️')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('salvar_logs_ticket')
                    .setLabel('Salvar Logs 📜')
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId('fechar_ticket_tentativa')
                    .setLabel('Fechar Atendimento 🔒')
                    .setStyle(ButtonStyle.Danger)
            );
            
            await canal.send({
                content: `${interaction.user} | ${
                    CARGO_STAFF_ID !== '123456789012345678'
                        ? `<@&${CARGO_STAFF_ID}>`
                        : '@Staff'
                } 🔔`,
                embeds: [embed],
                components: [bt]
            });

            await interaction.editReply({
                content: `✅ Seu canal de atendimento foi aberto com sucesso: ${canal}`
            });
        }

        // 2. BOTÃO: ASSUMIR TICKET
        if (interaction.customId === 'assumir_ticket') {
            if (
                CARGO_STAFF_ID !== '123456789012345678' &&
                !interaction.member.roles.cache.has(CARGO_STAFF_ID)
            ) {
                return interaction.reply({
                    content: '❌ Você não tem permissão para assumir este chamado!',
                    ephemeral: true
                });
            }

            if (interaction.message.embeds.description.includes('RESPONSÁVEL ATUAL:')) {
                return interaction.reply({
                    content: '❌ Este ticket já possui um Staff responsável encarregado!',
                    ephemeral: true
                });
            }

            const nEmbed = EmbedBuilder
                .from(interaction.message.embeds)
                .setDescription(
                    interaction.message.embeds.description +
                    `\n\n📌 **RESPONSÁVEL ATUAL:** ${interaction.user}`
                );

            await interaction.update({
                embeds: [nEmbed]
            });

            await interaction.channel.send({
                content: `🙋‍♂️ **Aviso:** Este chamado agora está sob os cuidados e responsabilidade de ${interaction.user}.`
            });
        }

        // 3. BOTÃO: SALVAR LOGS DO TICKET
        if (interaction.customId === 'salvar_logs_ticket') {
            await interaction.reply({
                content: '🔄 Extraindo histórico de mensagens...',
                ephemeral: true
            });

            const msg = await interaction.channel.messages.fetch({
                limit: 100
            });

            let txt = msg
                .reverse()
                .map(
                    m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`
                )
                .join('\n');

            const cLogs = interaction.guild.channels.cache.get(
                CANAL_LOGS_TICKETS
            );

            if (
                cLogs &&
                CANAL_LOGS_TICKETS !== '123456789012345678'
            ) {
                await cLogs.send({
                    content: `📜 Histórico de logs arquivado do canal \`#${interaction.channel.name}\``,
                    files: [
                        {
                            attachment: Buffer.from(txt, 'utf-8'),
                            name: `log-${interaction.channel.name}.txt`
                        }
                    ]
                });
            }

            await interaction.followUp({
                content: '✅ Histórico de mensagens salvo com sucesso nas logs administrativas!',
                ephemeral: true
            });
        }

        // 4. BOTÃO: TENTAR FECHAR O TICKET
        if (interaction.customId === 'fechar_ticket_tentativa') {
            const msgs = await interaction.channel.messages.fetch({
                limit: 50
            });

            if (!msgs.some(m => m.content.includes('sob os cuidados de'))) {
                return interaction.reply({
                    content: '❌ **Bloqueado:** Nenhum Staff assumiu o chamado ainda. O ticket precisa ser assumido antes de ser encerrado!',
                    ephemeral: true
                });
            }

            const modal = new ModalBuilder()
                .setCustomId('modal_motivo_fechamento')
                .setTitle('Fechar Atendimento');

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

        // 5. ENVIOU O MODAL DO MOTIVO -> ABRE O PAINEL DE AVALIAÇÃO COM BOTÕES LIMPOS
        if (
            interaction.isModalSubmit() &&
            interaction.customId === 'modal_motivo_fechamento'
        ) {
            await interaction.deferReply();

            const motivo = interaction.fields.getTextInputValue(
                'input_motivo_texto'
            );

            const msgsChat = await interaction.channel.messages.fetch({
                limit: 50
            });

            const msgAssumiu = msgsChat.find(
                m => m.content.includes('sob os cuidados de')
            );
            
            // O bot agora puxa dinamicamente a Staff e remove o ID estático falso que causava erro
            let staffIDMestre = interaction.user.id;

            if (msgAssumiu) {
                const match = msgAssumiu.content.match(/<@!?(\d+)>/);

                if (match) {
                    staffIDMestre = match[1];
                }
            }

            const topicosCanal = interaction.channel.name.split('-');
            const nomeMorador = topicosCanal[topicosCanal.length - 1];

            const membroCidadao = interaction.guild.members.cache.find(
                m => m.user.username.toLowerCase() === nomeMorador.toLowerCase()
            );

            if (membroCidadao) {
                await interaction.channel.permissionOverwrites.edit(
                    membroCidadao.id,
                    {
                        SendMessages: false
                    }
                ).catch(() => null);
            }

            const embedAvaliar = new EmbedBuilder()
                .setTitle('⭐ AVALIAÇÃO DE ATENDIMENTO | GUETO RP ⭐')
                .setDescription(
                    `O seu chamado foi encerrado pela nossa equipe administrativa.\n\n` +
                    `📌 **Motivo do Fechamento:** \`${motivo}\`\n` +
                    `👤 **Atendente:** <@${staffIDMestre}>\n\n` +
                    `Por favor, utilize os botões abaixo para avaliar a qualidade do suporte recebido de **1 a 5 estrelas**! O canal será excluído após o seu voto.`
                )
                .setColor('#0000ff')
                .setTimestamp();

            // Salva as informações direto na memória volátil do Discord para os botões nunca estourarem
            if (!interaction.client.dadosTickets) {
                interaction.client.dadosTickets = new Map();
            }

            interaction.client.dadosTickets.set(
                interaction.channel.id,
                {
                    motivo: motivo,
                    staffID: staffIDMestre
                }
            );

            const btsEstrelas = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('voto_1')
                    .setLabel('1 ⭐')
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId('voto_2')
                    .setLabel('2 ⭐')
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId('voto_3')
                    .setLabel('3 ⭐')
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId('voto_4')
                    .setLabel('4 ⭐')
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId('voto_5')
                    .setLabel('5 ⭐')
                    .setStyle(ButtonStyle.Primary)
            );

            await interaction.editReply({
                content: '🔒 Atendimento finalizado. Aguardando a avaliação do cidadão...',
                embeds: [embedAvaliar],
                components: [btsEstrelas]
            });
        }

        // 6. PROCESSA O CLIQUE NAS ESTRELAS -> ENVIA AS LOGS E DETONA A SALA
        if (
            interaction.isButton() &&
            interaction.customId.startsWith('voto_')
        ) {
            await interaction.deferUpdate();
            
            const notaEstrelas = parseInt(
                interaction.customId.replace('voto_', ''),
                10
            ) || 5;
            
            let motivoOriginal = 'Não informado';
            let idStaffAtendente = interaction.user.id;

            if (
                interaction.client.dadosTickets &&
                interaction.client.dadosTickets.has(interaction.channel.id)
            ) {
                const dadosGuardados = interaction.client.dadosTickets.get(
                    interaction.channel.id
                );

                motivoOriginal = dadosGuardados.motivo;
                idStaffAtendente = dadosGuardados.staffID;

                interaction.client.dadosTickets.delete(
                    interaction.channel.id
                );
            }

            const embedLogFinal = new EmbedBuilder()
                .setTitle('🟥 CHAMADO ENCERRADO E AVALIADO')
                .setColor('#0000ff')
                .addFields([
                    {
                        name: '🎫 Canal Suportado',
                        value: `#${interaction.channel.name}`,
                        inline: true
                    },
                    {
                        name: '👤 Cidadão Solicitante',
                        value: `${interaction.user}`,
                        inline: true
                    },
                    {
                        name: '👮 Staff Atendente',
                        value: `<@${idStaffAtendente}>`,
                        inline: true
                    },
                    {
                        name: '📊 Nota do Suporte',
                        value: `\`\`\`fix
${'⭐'.repeat(notaEstrelas)} (${notaEstrelas}/5 Estrelas)
\`\`\``,
                        inline: false
                    },
                    {
                        name: '📌 Motivo de Encerramento',
                        value: `\`\`\`md
> ${motivoOriginal}
\`\`\``,
                        inline: false
                    }
                ])
                .setTimestamp();

            const cLogs = interaction.guild.channels.cache.get(
                CANAL_LOGS_TICKETS
            );

            if (
                cLogs &&
                CANAL_LOGS_TICKETS !== '123456789012345678'
            ) {
                await cLogs.send({
                    embeds: [embedLogFinal]
                }).catch(() => null);

                const mensagensFinais =
                    await interaction.channel.messages.fetch({
                        limit: 100
                    });

                let txtFinal = mensagensFinais
                    .reverse()
                    .map(
                        m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`
                    )
                    .join('\n');

                await cLogs.send({
                    files: [
                        {
                            attachment: Buffer.from(txtFinal, 'utf-8'),
                            name: `final-log-${interaction.channel.name}.txt`
                        }
                    ]
                }).catch(() => null);
            }

            await interaction.editReply({
                content: `✅ **Obrigado pela sua avaliação!** Computado ${notaEstrelas}/5 estrelas para a nossa equipe. O canal será excluído em 5 segundos...`,
                embeds: [],
                components: []
            });

            setTimeout(() => {
                interaction.channel.delete().catch(() => null);
            }, 5000);
        }
    }
};