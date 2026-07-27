const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    async handleInteraction(interaction, client) {
        
        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
        // ⚙️ CENTRAL DE CONFIGURAÇÃO DE CARGOS DO GUETO RP
        // Coloque abaixo os IDs numéricos reais do seu Discord
        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
        const CONFIG = { 
            CARGO_COM_REGISTRO: '1527698641412817056', // Cargo ganho ao passar (Morador/Cidadão)
            CARGO_COM_ID:       '1529945344241176738', // Primeiro cargo retirado (Com ID)
            CARGO_SEM_REGISTRO: '1515730336313512076' // Segundo cargo retirado (Sem Registro)
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

        // 1. CLICOU NO BOTÃO "FAZER WHITELIST" NO PAINEL
        if (interaction.customId === 'iniciar_wl_botao') {
            
            // Trava máxima: Se ele já foi aprovado e completou, bloqueia para sempre
            if (client.wlCompletadas.has(interaction.user.id)) {
                return interaction.reply({ content: '⚠️ **Bloqueado:** Você já realizou o seu exame de Whitelist com sucesso e já é um morador aprovado!', ephemeral: true });
            }

            // 🚨 SOLUÇÃO DO BUG: Se ele já tinha uma sessão mas clicou em iniciar de novo (porque ignorou a mensagem), reseta a antiga e deixa ele tentar novamente do zero!
            if (client.wlSessions.has(interaction.user.id)) {
                client.wlSessions.delete(interaction.user.id);
            }

            // Cria a nova sessão zerada na hora
            client.wlSessions.set(interaction.user.id, { etapa: 0, acertos: 0 });
            return enviarEtapaWl(interaction, interaction.user.id, questionario, client);
        }

        // 2. CLICOU EM UMA DAS ALTERNATIVAS (A, B, C ou D)
        if (interaction.customId.startsWith('wl_resp_')) {
            const sessao = client.wlSessions.get(interaction.user.id);
            if (!sessao) return interaction.reply({ content: '❌ Sessão expirada. Clique em "Fazer Whitelist" novamente no painel público.', ephemeral: true });

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

                if (passou) {
                    // Salva na lista definitiva de aprovados para ele nunca mais conseguir refazer
                    client.wlCompletadas.add(interaction.user.id);
                    await interaction.editReply({ content: `🎉 **PARABÉNS! Você acertou ${sessao.acertos}/7 questões e foi aprovado no Gueto RP!**\nSeus cargos foram aplicados automaticamente. Divirta-se!`, embeds: [], components: [] });
                    
                    const m = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
                    if (m) {
                        try { if (CONFIG.CARGO_COM_REGISTRO !== '123456789012345678') await m.roles.add(CONFIG.CARGO_COM_REGISTRO); } catch(e){}
                        try { if (CONFIG.CARGO_COM_ID !== '123456789012345678') await m.roles.remove(CONFIG.CARGO_COM_ID); } catch(e){}
                        try { if (CONFIG.CARGO_SEM_REGISTRO !== '123456789012345678') await m.roles.remove(CONFIG.CARGO_SEM_REGISTRO); } catch(e){}
                    }
                } else {
                    await interaction.editReply({ content: `❌ **Você acertou apenas ${sessao.acertos}/7 questões e foi reprovado.**\nÉ necessário acertar pelo menos 3 perguntas. Estude as regras e tente novamente clicando no botão principal!`, embeds: [], components: [] });
                }
            }
        }
    }
};

async function enviarEtapaWl(interaction, userId, questionario, client) {
    const sessao = client.wlSessions.get(userId);
    const questao = questionario[sessao.etapa];
    const embed = new EmbedBuilder()
        .setTitle(`📝 EXAME DE WHITELIST — QUESTÃO ${sessao.etapa + 1} DE 7`)
        .setDescription(`**${questao.pergunta}**\n\n${questao.opcoes.join('\n')}\n\n⚠️ *Escolha a alternativa correta utilizando os botões abaixo:*`)
        .setColor('#0000ff');

    const bts = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`wl_resp_A`).setLabel('Alternativa A').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`wl_resp_B`).setLabel('Alternativa B').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`wl_resp_C`).setLabel('Alternativa C').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`wl_resp_D`).setLabel('Alternativa D').setStyle(ButtonStyle.Secondary)
    );

    return interaction.customId === 'iniciar_wl_botao' 
        ? interaction.reply({ embeds: [embed], components: [bts], ephemeral: true }) 
        : interaction.update({ embeds: [embed], components: [bts], ephemeral: true });
}
