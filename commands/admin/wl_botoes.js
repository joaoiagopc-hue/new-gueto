const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    async handleInteraction(interaction, client) {
        
        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
        // ⚙️ CENTRAL DE CONFIGURAÇÃO DE CARGOS DO GUETO RP
        // Substitua os números abaixo pelos IDs reais do seu Discord!
        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
        const CONFIG = { 
            CARGO_COM_REGISTRO: '1527698641412817056', // Cargo ganho ao passar (Morador/Cidadão)
            CARGO_COM_ID:       '1529945344241176738', // Primeiro cargo retirado (Com ID)
            CARGO_SEM_REGISTRO: '1515730336313512076'// ID do segundo cargo retirado (Sem Registro)
        };
        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

        const questionario = [
            { pergunta: "1️⃣ O que significa a regra 'VDM' (Vehicle Deathmatch)?", opcoes: ["A) Matar outro jogador usando um veículo como arma sem motivo de RP.", "B) Fugir da polícia utilizando uma moto superesportiva.", "C) Consertar o veículo no meio de uma perseguição activa.", "D) Assaltar uma pessoa que está dirigindo um carro de luxo."], correta: "A" },
            { pergunta: "2️⃣ Qual das opções abaixo descreve uma atitude de 'Combat Log'?", opcoes: ["A) Iniciar um tiroteio contra a polícia dentro de uma favela.", "B) Sair do jogo ou deslogar no meio de uma ação ativa para não perder itens.", "C) Gravar a ação de Roleplay para postar nas redes sociais.", "D) Chamar a administração no meio de um assalto ativo."], correta: "B" },
            { pergunta: "3️⃣ O que é a regra 'Amor à Vida' (Fear RP)?", opcoes: ["A) Entrar em uma área perigosa sem nenhuma arma para se defender.", "B) Desobedecer ordens de criminosos armados porque você sabe atirar bem.", "C) Valorizar a vida do seu personagem, agindo com medo real ao ser rendido.", "D) Chamar uma ambulância sempre que ver alguém ferido na calçada."], correta: "C" },
            { pergunta: "4️⃣ O que caracteriza a quebra da regra 'Metagaming'?", opcoes: ["A) Utilizar informações de fora do jogo (Discord/Lives) para se beneficiar no RP.", "B) Comprar armas ilegais de uma facção rival.", "C) Roubar o carro de outro cidadão usando uma gazua.", "D) Falar palavras da vida real utilizando o chat de voz local."], correta: "A" },
            { pergunta: "5️⃣ Qual o comportamento correto durante uma abordagem policial?", opcoes: ["A) Render-se imediatamente, levantar as mãos e colaborar com as ordens.", "B) Sacar uma arma e atirar mesmo estando cercado por três viaturas.", "C) Atropelar o policial e fugir rindo para o hospital.", "D) Deslogar do servidor para nascer na sua casa salvo."], correta: "A" },
            { pergunta: "6️⃣ O que significa 'Powergaming' no Roleplay?", opcoes: ["A) Realizar ações impossíveis de acontecer na vida real (ex: voar com carro comum).", "B) Comprar itens caros na loja VIP do servidor.", "C) Chamar amigos para jogar no mesmo grupo criminoso.", "D) Disparar tiros para o alto para assustar moradores."], correta: "A" },
            { pergunta: "7️⃣ O que significa 'RDM' (Random Deathmatch)?", opcoes: ["A) Agredir ou matar outro jogador sem nenhum motivo ou histórico de RP.", "B) Roubar um estabelecimento comercial sem usar máscara.", "C) Fugir a pé de uma abordagem policial na rodovia.", "D) Trocar de roupa no meio de uma perseguição policial."], correta: "A" }
        ];

        if (!client.wlSessions) client.wlSessions = new Map();
        if (!client.wlCompletadas) client.wlCompletadas = new Set();

        // 1. CLICOU NO BOTÃO "FAZER WHITELIST" NO PAINEL PRINCIPAL
        if (interaction.customId === 'iniciar_wl_botao') {
            
            // Trava máxima de segurança contra aprovados refazendo o teste
            if (client.wlCompletadas.has(interaction.user.id)) {
                return interaction.reply({ 
                    content: '⚠️ **Bloqueado:** Você já realizou o seu exame de Whitelist com sucesso e já é um morador aprovado no Gueto RP!', 
                    ephemeral: true 
                });
            }

            // CORREÇÃO DO BUG: Se ele sumiu com a mensagem, o bot apaga a sessão velha e cria uma nova limpa na hora
            if (client.wlSessions.has(interaction.user.id)) {
                client.wlSessions.delete(interaction.user.id);
            }

            client.wlSessions.set(interaction.user.id, { etapa: 0, acertos: 0 });
            return enviarEtapaWl(interaction, interaction.user.id, questionario, client);
        }

        // 2. CLICOU EM UMA DAS ALTERNATIVAS DO TESTE (A, B, C ou D)
        if (interaction.customId.startsWith('wl_resp_')) {
            const sessao = client.wlSessions.get(interaction.user.id);
            if (!sessao) {
                return interaction.reply({ 
                    content: '❌ **Sessão Expirada:** Clique no botão azul "Fazer Whitelist" novamente no painel público para recomeçar.', 
                    ephemeral: true 
                });
            }

            const escolha = interaction.customId.replace('wl_resp_', '');
            const qAtual = questionario[sessao.etapa];
            
            if (escolha === qAtual.correta) sessao.acertos++;

            sessao.etapa++;

            if (sessao.etapa < questionario.length) {
                return enviarEtapaWl(interaction, interaction.user.id, questionario, client);
            } else {
                await interaction.deferUpdate();
                client.wlSessions.delete(interaction.user.id);

                const passou = sessao.acertos >= 3;

                // Formatação do comprovante do teste no estilo escuro e denso premium solicitado
                const embedResultado = new EmbedBuilder()
                    .setTitle('🧱 GUETO RP • Resultado da Whitelist')
                    .setColor('#2f3136')
                    .setTimestamp();

                if (passou) {
                    client.wlCompletadas.add(interaction.user.id);

                    embedResultado.setDescription(
                        `🎉 **PARABÉNS! Você concluiu a verificação de regras com sucesso!**\n\n` +
                        `📌 **STATUS:** \`MORADOR APROVADO / LIBERADO\`\n\n` +
                        `┃ **ACERTOS:** ${sessao.acertos}/7 Questões\n` +
                        `┃ **RESULTADO:** Acesso concedido às vias de Brookhaven.\n\n` +
                        `✅ Seus cargos antigos foram removidos e a tag de Morador foi aplicada. Divirta-se!`
                    );

                    await interaction.editReply({ embeds: [embedResultado], components: [] });
                    
                    const m = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
                    if (m) {
                        try { if (CONFIG.CARGO_COM_REGISTRO !== '123456789012345678') await m.roles.add(CONFIG.CARGO_COM_REGISTRO); } catch(e){}
                        try { if (CONFIG.CARGO_COM_ID !== '123456789012345678') await m.roles.remove(CONFIG.CARGO_COM_ID); } catch(e){}
                        try { if (CONFIG.CARGO_SEM_REGISTRO !== '123456789012345678') await m.roles.remove(CONFIG.CARGO_SEM_REGISTRO); } catch(e){}
                    }
                } else {
                    embedResultado.setDescription(
                        `❌ **Você foi reprovado por falta de pontuação.**\n\n` +
                        `📌 **STATUS:** \`REPROVADO / REFAZER EXAME\`\n\n` +
                        `┃ **ACERTOS:** ${sessao.acertos}/7 Questões (Mínimo necessário: 3 acertos)\n` +
                        `┃ **DIRETRIZ:** É necessário estudar melhor os conceitos básicos de RP.\n\n` +
                        `⚠️ Não desanime! Estude a nossa central de regras e clique no painel público para tentar novamente.`
                    );

                    await interaction.editReply({ embeds: [embedResultado], components: [] });
                }
            }
        }
    }
};

async function enviarEtapaWl(interaction, userId, questionario, client) {
    const sessao = client.wlSessions.get(userId);
    const questao = questionario[sessao.etapa];
    
    // Embed das perguntas estilizada com o novo fundo escuro densificado premium
    const embed = new EmbedBuilder()
        .setTitle(`📝 EXAME DE WHITELIST — QUESTÃO ${sessao.etapa + 1} DE 7`)
        .setDescription(
            `**${questao.pergunta}**\n\n` +
            `${questao.opcoes.join('\n')}\n\n` +
            `⚠️ *Utilize os botões vermelhos no rodapé para votar na alternativa correta:*`
        )
        .setColor('#2f3136');

    // Botões das alternativas padronizados com o estilo Danger (Vermelho) baseado na sua referência
    const bts = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`wl_resp_A`).setLabel('A').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`wl_resp_B`).setLabel('B').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`wl_resp_C`).setLabel('C').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`wl_resp_D`).setLabel('D').setStyle(ButtonStyle.Danger)
    );

    return interaction.customId === 'iniciar_wl_botao' 
        ? interaction.reply({ embeds: [embed], components: [bts], ephemeral: true }) 
        : interaction.update({ embeds: [embed], components: [bts], ephemeral: true });
}
