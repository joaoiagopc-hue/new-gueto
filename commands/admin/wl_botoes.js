const { PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    async handleInteraction(interaction) {
        // CONFIGURAÇÕES DA WL (Substitua pelos IDs reais do seu novo servidor)
        const CONFIG = {
            CANAL_STAFF_ID: '1506593481513111563', 
            CARGO_COM_REGISTRO: '1527698641412817056',   // Cargo que ele GANHA ao passar (Morador)
            CARGO_COM_ID: '1529945344241176738',               // Primeiro cargo retirado (Com ID)
            CARGO_SEM_REGISTRO: '1515730336313512076',   // Segundo cargo retirado (Sem Registro)
            CATEGORIA_WL_ID: '1526970343309312173',
            CARGO_STAFF_MARCACAO_ID: '1515730228528418956' 
        };

        const perguntas = [
            "1️⃣ Qual o nome e idade do seu personagem no RP?",
            "2️⃣ O que é Anti-RP? Dê um exemplo.",
            "3️⃣ O que é Amor à Vida (Fear RP)? Dê um exemplo.",
            "4️⃣ O que significa Powergaming? Dê um exemplo.",
            "5️⃣ O que significa Metagaming? Dê um exemplo.",
            "6️⃣ Como você agiria se fosse abordado por 2 assaltantes armados?",
            "7️⃣ Por que você quer entrar na cidade Gueto RP?"
        ];

        if (interaction.customId === 'iniciar_wl_botao') {
            await interaction.deferReply({ ephemeral: true });
            const nomeCanal = `teste-wl-${interaction.user.username}`.toLowerCase();
            
            const canalExiste = interaction.guild.channels.cache.find(c => c.name === nomeCanal);
            if (canalExiste) return interaction.editReply({ content: `❌ Você já possui um teste em andamento aqui: ${canalExiste}`, ephemeral: true });

            const canalWl = await interaction.guild.channels.create({
                name: nomeCanal,
                type: 0,
                parent: CONFIG.CATEGORIA_WL_ID,
                permissionOverwrites: [
                    { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
                ],
            });

            await interaction.editReply({ content: `📝 Seu canal de teste foi criado! Vá até lá para responder: ${canalWl}`, ephemeral: true });
            await canalWl.send({ content: `👋 Olá ${interaction.user}, bem-vindo ao teste de Whitelist do **Gueto RP**!\n\nVocê deve responder **7 perguntas** consecutivas no chat. Estude bem as regras antes de formular suas respostas.\n\nDigite qualquer mensagem abaixo para receber a primeira pergunta!` });

            const filter = m => m.author.id === interaction.user.id;
            const collector = canalWl.createMessageCollector({ filter, idle: 300000 });

            let etapa = 0;
            const respostas = [];

            collector.on('collect', async m => {
                if (etapa === 0) {
                    await canalWl.send(`**${perguntas[etapa]}**`);
                    etapa++;
                    return;
                }
                respostas.push(m.content);
                if (etapa < perguntas.length) {
                    await canalWl.send(`**${perguntas[etapa]}**`);
                    etapa++;
                } else { collector.stop('concluido'); }
            });

            collector.on('end', async (collected, reason) => {
                if (reason === 'concluido') {
                    await canalWl.send('✅ **Perfeito! Suas respostas foram coletadas com sucesso.** Este canal será deletado em 10 segundos e enviado para a Staff.');
                    
                    const embedStaff = new EmbedBuilder()
                        .setTitle('📋 ✨ AVALIAÇÃO DE WHITELIST (7 PERGUNTAS) ✨ 📋')
                        .setDescription(`👤 **CANDIDATO:** ${interaction.user} (\`${interaction.user.id}\`)`)
                        .setColor('#0000ff') // Azul Oficial
                        .addFields(
                            { name: perguntas, value: `\`\`\`md\n${respostas || 'Sem resposta'}\n\`\`\`` },
                            { name: perguntas, value: `\`\`\`md\n${respostas || 'Sem resposta'}\n\`\`\`` },
                            { name: perguntas, value: `\`\`\`md\n${respostas || 'Sem resposta'}\n\`\`\`` },
                            { name: perguntas, value: `\`\`\`md\n${respostas || 'Sem resposta'}\n\`\`\`` },
                            { name: perguntas, value: `\`\`\`md\n${respostas || 'Sem resposta'}\n\`\`\`` },
                            { name: perguntas, value: `\`\`\`md\n${respostas || 'Sem resposta'}\n\`\`\`` },
                            { name: perguntas, value: `\`\`\`md\n${respostas || 'Sem resposta'}\n\`\`\`` }
                        )
                        .setTimestamp();

                    const botoesStaff = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId(`aprovar_wl_${interaction.user.id}`).setLabel('Aprovar').setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setCustomId(`reprovar_wl_${interaction.user.id}`).setLabel('Reprovar').setStyle(ButtonStyle.Danger)
                    );

                    const canalStaff = interaction.guild.channels.cache.get(CONFIG.CANAL_STAFF_ID);
                    if (canalStaff) {
                        await canalStaff.send({ 
                            content: `🔔 <@&${CONFIG.CARGO_STAFF_MARCACAO_ID}> | **Nova Whitelist enviada para avaliação!**`, 
                            embeds: [embedStaff], 
                            components: [botoesStaff] 
                        });
                    }
                    setTimeout(() => canalWl.delete().catch(() => null), 10000);
                } else {
                    await canalWl.send('❌ Tempo esgotado!');
                    setTimeout(() => canalWl.delete().catch(() => null), 10000);
                }
            });
        }

        // BOTÃO APROVAR
        if (interaction.customId.startsWith('aprovar_wl_')) {
            const userId = interaction.customId.replace('aprovar_wl_', '');
            await interaction.reply({ content: '✅ Whitelist aprovada com sucesso!', ephemeral: true });

            const m = await interaction.guild.members.fetch(userId).catch(() => null);
            if (m) {
                try {
                    const cargoReg = interaction.guild.roles.cache.get(CONFIG.CARGO_COM_REGISTRO);
                    if (cargoReg) await m.roles.add(cargoReg);
                } catch (err) { console.log(err); }

                try {
                    const cargoId = interaction.guild.roles.cache.get(CONFIG.CARGO_COM_ID);
                    if (cargoId && m.roles.cache.has(CONFIG.CARGO_COM_ID)) {
                        await m.roles.remove(cargoId);
                    }
                } catch (err) { console.log(err); }

                try {
                    const cargoSemReg = interaction.guild.roles.cache.get(CONFIG.CARGO_SEM_REGISTRO);
                    if (cargoSemReg && m.roles.cache.has(CONFIG.CARGO_SEM_REGISTRO)) {
                        await m.roles.remove(cargoSemReg);
                    }
                } catch (err) { console.log(err); }

                await m.send('🎉 **PARABÉNS, VOCÊ FOI APROVADO!**\n\nSua Whitelist no **Gueto RP** foi aprovada! Você recebeu seu cargo definitivo de morador e já está liberado para o jogo! Boa diversão! 🎒🚘').catch(() => null);
            }
            await interaction.message.delete();
        }

        // BOTÃO REPROVAR
        if (interaction.customId.startsWith('reprovar_wl_')) {
            const userId = interaction.customId.replace('reprovar_wl_', '');
            await interaction.reply({ content: '❌ Whitelist reprovada.', ephemeral: true });

            const m = await interaction.guild.members.fetch(userId).catch(() => null);
            if (m) {
                await m.send('❌ **Aviso de Whitelist:**\nInfelizmente seu teste no **Gueto RP** foi reprovado. Estude melhor as regras e tente novamente.').catch(() => null);
            }
            await interaction.message.delete();
        }
    }
};
