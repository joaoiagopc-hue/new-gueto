const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    async handleInteraction(interaction, client) {
        // CONFIGURAÇÕES DA WHITELIST DO GUETO RP (Coloque seus IDs reais aqui)
        const CONFIG = {
            CANAL_STAFF_ID: '1506593481513111563', 
            CARGO_COM_REGISTRO: '1527698641412817056',   
            CARGO_COM_ID: '1529945344241176738',               
            CARGO_SEM_REGISTRO: '1515730336313512076',   
            CARGO_STAFF_MARCACAO_ID: '1515730228528418956'
        };

        const questionario = [
            { pergunta: "1️⃣ O que significa a regra 'VDM' (Vehicle Deathmatch)?", opcoes: ["A) Matar outro jogador usando um veículo como arma sem motivo de RP.", "B) Fugir da polícia utilizando uma moto superesportiva.", "C) Consertar o veículo no meio de uma perseguição ativa.", "D) Assaltar uma pessoa que está dirigindo um carro de luxo."], correta: "A" },
            { pergunta: "2️⃣ Qual das opções abaixo descreve uma atitude de 'Combat Log'?", opcoes: ["A) Iniciar um tiroteio contra a polícia dentro de uma favela.", "B) Sair do jogo ou deslogar no meio de uma ação ou abordagem para não perder itens.", "C) Gravar a ação de Roleplay para postar nas redes sociais.", "D) Chamar a administração no meio de um assalto ativo."], correta: "B" },
            { pergunta: "3️⃣ O que é a regra 'Amor à Vida' (Fear RP)?", opcoes: ["A) Entrar em uma área perigosa sem nenhuma arma para se defender.", "B) Desobedecer ordens de criminosos armados porque você sabe atirar bem.", "C) Valorizar a vida do seu personagem, agindo com medo real ao ser rendido sob mira de armas.", "D) Chamar uma ambulância sempre que ver alguém ferido na calçada."], correta: "C" },
            { pergunta: "4️⃣ O que caracteriza a quebra da regra 'Metagaming'?", opcoes: ["A) Utilizar informações de fora do jogo (como lives ou chats do Discord) para se beneficiar no RP.", "B) Comprar armas ilegais de uma facção rival sem fazer contrato.", "C) Roubar o carro de outro cidadão usando uma ferramenta de chave mestra.", "D) Falar palavras da vida real utilizando o chat de voz local."], correta: "A" },
            { pergunta: "5️⃣ Qual o comportamento correto durante uma abordagem policial?", opcoes: ["A) Render-se imediatamente, levantar as mãos e colaborar com as ordens dos policiais.", "B) Sacar uma arma e atirar mesmo estando cercado por três viaturas.", "C) Atropelar o policial e fugir rindo para o hospital.", "D) Deslogar do servidor para nascer na sua casa salvo."], correta: "A" }
        ];

        // Inicializa as listas de controle na memória do bot caso não existam
        if (!client.wlSessions) client.wlSessions = new Map();
        if (!client.wlCompletadas) client.wlCompletadas = new Set();

        // 1. CLICOU NO BOTÃO "FAZER WHITELIST" DO PAINEL PÚBLICO
        if (interaction.customId === 'iniciar_wl_botao') {
            // 🚨 NOVA TRAVA: Verifica se o ID do cidadão já está na lista de exames enviados à Staff
            if (client.wlCompletadas.has(interaction.user.id)) {
                return interaction.reply({ 
                    content: '⚠️ **Bloqueado:** Você já realizou o seu exame de Whitelist e suas respostas já foram enviadas para avaliação da Staff! Aguarde o resultado pacientemente em seus cargos ou na sua DM.', 
                    ephemeral: true 
                });
            }

            if (client.wlSessions.has(interaction.user.id)) {
                return interaction.reply({ content: '⚠️ Você já iniciou sua prova! Continue respondendo nas mensagens secretas abaixo.', ephemeral: true });
            }

            client.wlSessions.set(interaction.user.id, { etapa: 0, acertos: 0, historico: [] });
            return enviarEtapaWl(interaction, interaction.user.id, questionario, client);
        }

        // 2. CLICOU EM UMA DAS ALTERNATIVAS (A, B, C ou D)
        if (interaction.customId.startsWith('wl_resp_')) {
            const sessao = client.wlSessions.get(interaction.user.id);
            if (!sessao) return interaction.reply({ content: '❌ Sessão expirada. Clique em "Fazer Whitelist" novamente no painel.', ephemeral: true });

            const respostaEscolhida = interaction.customId.replace('wl_resp_', '');
            const questaoAtual = questionario[sessao.etapa];

            if (respostaEscolhida === questaoAtual.correta) sessao.acertos++;

            sessao.historico.push({ pergunta: questaoAtual.pergunta, escolhida: respostaEscolhida, correta: questaoAtual.correta });
            sessao.etapa++;

            if (sessao.etapa < questionario.length) {
                return enviarEtapaWl(interaction, interaction.user.id, questionario, client);
            } else {
                await interaction.deferUpdate();
                client.wlSessions.delete(interaction.user.id);

                const totalQuestoes = questionario.length;
                const passou = sessao.acertos === totalQuestoes;

                // 🚨 CARIMBA O ID DO JOGADOR NA LISTA DE TESTES COMPLETADOS E ENVIADOS
                client.wlCompletadas.add(interaction.user.id);

                if (passou) {
                    await interaction.editReply({ content: `🎉 **PARABÉNS! Você acertou ${sessao.acertos}/${totalQuestoes} questões e foi aprovado no Gueto RP!**\nSeus cargos foram liberados com sucesso e sua entrada na cidade está autorizada!`, embeds: [], components: [] });
                    const m = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
                    if (m) {
                        try { if (CONFIG.CARGO_COM_REGISTRO !== '123456789012345678') await m.roles.add(CONFIG.CARGO_COM_REGISTRO); } catch(e){}
                        try { if (CONFIG.CARGO_COM_ID !== '123456789012345678') await m.roles.remove(CONFIG.CARGO_COM_ID); } catch(e){}
                        try { if (CONFIG.CARGO_SEM_REGISTRO !== '123456789012345678') await m.roles.remove(CONFIG.CARGO_SEM_REGISTRO); } catch(e){}
                    }
                } else {
                    await interaction.editReply({ content: `❌ **O seu questionário foi concluído, porém você errou alguma questão técnica de Roleplay e foi reprovado nesta tentativa.**\nEstude melhor os conceitos do servidor. Suas respostas foram arquivadas pela administração para fins de registro!`, embeds: [], components: [] });
                }

                const canalStaff = interaction.guild.channels.cache.get(CONFIG.CANAL_STAFF_ID);
                if (canalStaff && CONFIG.CANAL_STAFF_ID !== '123456789012345678') {
                    const embedStaffLog = new EmbedBuilder()
                        .setTitle(passou ? '🟩 WHITELIST APROVADA (100% DE ACERTOS)' : '🟥 WHITELIST REPROVADA')
                        .setDescription(`👤 **Candidato:** ${interaction.user} (\`${interaction.user.id}\`)\n📊 **Pontuação:** \`${sessao.acertos} / ${totalQuestoes}\``)
                        .setColor(passou ? '#00ff00' : '#ff0000')
                        .setTimestamp();
                    sessao.historico.forEach(h => {
                        embedStaffLog.addFields({ name: h.pergunta, value: `Marcada: \`${h.escolhida}\` | Correta: \`${h.correta}\` ${h.escolhida === h.correta ? '✅' : '❌'}` });
                    });
                    const mencaoStaff = CONFIG.CARGO_STAFF_MARCACAO_ID !== '123456789012345678' ? `<@&${CONFIG.CARGO_STAFF_MARCACAO_ID}>` : '';
                    await canalStaff.send({ content: mencaoStaff, embeds: [embedStaffLog] });
                }
            }
        }
    }
};

async function enviarEtapaWl(interaction, userId, questionario, client) {
    const sessao = client.wlSessions.get(userId);
    const questao = questionario[sessao.etapa];
    const embedPergunta = new EmbedBuilder()
        .setTitle(`📝 EXAME DE WHITELIST — QUESTÃO ${sessao.etapa + 1} DE ${questionario.length}`)
        .setDescription(`**${questao.pergunta}**\n\n${questao.opcoes.join('\n')}\n\n⚠️ *Escolha a alternativa correta abaixo:*`)
        .setColor('#0000ff');

    const filaBotoes = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`wl_resp_A`).setLabel('Alternativa A').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`wl_resp_B`).setLabel('Alternativa B').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`wl_resp_C`).setLabel('Alternativa C').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`wl_resp_D`).setLabel('Alternativa D').setStyle(ButtonStyle.Secondary)
    );

    if (interaction.customId === 'iniciar_wl_botao') {
        return interaction.reply({ embeds: [embedPergunta], components: [filaBotoes], ephemeral: true });
    } else {
        return interaction.update({ embeds: [embedPergunta], components: [filaBotoes], ephemeral: true });
    }
}
