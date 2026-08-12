const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const caminhoBancoPassaportes = path.join(__dirname, '../../usuarios_passaporte.json');

module.exports = {
    handleInteraction: async function(interaction) {
        return await this.processarWLAUTOMATICA(interaction);
    },

    handleInteractions: async function(interaction) {
        return await this.processarWLAUTOMATICA(interaction);
    },

    async processarWLAUTOMATICA(interaction) {

        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
        // ⚙️ CONFIGURAÇÃO DE CARGOS DA WHITE-LIST
        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

        const CARGO_COM_ID = '1529945344241176738';
        const CARGO_SEM_REGISTRO = '1515730336313512076';
        const CARGO_REGISTRADO = '1527698641412817056';
        const CANAL_LOG_WL = '1506593481513111563';

        // 🖼️ Coloque aqui o LINK DIRETO da imagem
        const URL_FOTO_WL = 'https://cdn.discordapp.com/attachments/1519870266216288270/1537202417547083826/content.png?ex=6a7e2ed0&is=6a7cdd50&hm=21b547a1492d8ea08ae99a4338dfa89acad956532a795898b7e6978858846a3d&';

        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

        const questaoExame = [
            {
                titulo: "1️⃣ O que significa a infração VDM (Vehicle Deathmatch)?",
                opcoes: [
                    { id: 'A', txt: "A) Roubar o carro de um morador com abordagem verbal." },
                    { id: 'B', txt: "B) Usar um veículo como arma para atropelar e ferir pessoas de propósito." },
                    { id: 'C', txt: "C) Fugir da polícia dirigindo em alta velocidade." },
                    { id: 'D', txt: "D) Consertar o veículo dentro de uma área de mecânica." }
                ],
                correta: 'B'
            },

            {
                titulo: "2️⃣ Qual conduta configura a regra de RDM (Random Deathmatch)?",
                opcoes: [
                    { id: 'A', txt: "A) Iniciar disparos e matar outro cidadão do nada, sem conversa prévia." },
                    { id: 'B', txt: "B) Assaltar uma loja de conveniência em dupla." },
                    { id: 'C', txt: "C) Chamar a polícia pelo celular após sofrer uma agressão." },
                    { id: 'D', txt: "D) Discutir verbalmente no meio do trânsito da cidade." }
                ],
                correta: 'A'
            },

            {
                titulo: "3️⃣ O que é classificado como Metagaming?",
                opcoes: [
                    { id: 'A', txt: "A) Utilizar roupas idênticas às dos membros da sua facção." },
                    { id: 'B', txt: "B) Convidar amigos para jogar no mesmo servidor." },
                    { id: 'C', txt: "C) Usar dados de fora (calls do Discord ou WhatsApp) para se beneficiar no jogo." },
                    { id: 'D', txt: "D) Comprar carros importados diretamente na concessionária VIP." }
                ],
                correta: 'C'
            },

            {
                titulo: "4️⃣ Se um assaltante apontar uma arma para a sua cabeça, você deve:",
                opcoes: [
                    { id: 'A', txt: "A) Correr, pular de um viaduto e tentar dar Alt+F4." },
                    { id: 'B', txt: "B) Valorizar a vida (FearRP), levantar as mãos e obedecer às ordens." },
                    { id: 'C', txt: "C) Puxar uma arma correndo e atirar na cabeça do assaltante." },
                    { id: 'D', txt: "D) Ofender o jogador no chat local e sair andando." }
                ],
                correta: 'B'
            },

            {
                titulo: "5️⃣ Qual ação viola frontalmente a regra de Powergaming?",
                opcoes: [
                    { id: 'A', txt: "A) Capotar o carro várias vezes, ignorar o acidente e continuar correndo." },
                    { id: 'B', txt: "B) Trabalhar honestamente como lixeiro na prefeitura." },
                    { id: 'C', txt: "C) Abrir um chamado privado de suporte para falar com os administradores." },
                    { id: 'D', txt: "D) Customizar as rodas e a cor da pintura de uma moto." }
                ],
                correta: 'A'
            },

            {
                titulo: "6️⃣ Sair do jogo (dar Alt+F4 ou desconectar) no meio de um assalto ou ação é:",
                opcoes: [
                    { id: 'A', txt: "A) Permitido se você estiver com pressa para sair de casa." },
                    { id: 'B', txt: "B) Permitido apenas se você estiver perdendo os seus pertences." },
                    { id: 'C', txt: "C) Combat Logging (C-Log), que quebra a imersão e gera banimento." },
                    { id: 'D', txt: "D) Uma mecânica normal de fuga de cenários perigosos." }
                ],
                correta: 'C'
            },

            {
                titulo: "7️⃣ O crime, roubos e sequestros são estritamente proibidos em qual perímetro?",
                opcoes: [
                    { id: 'A', txt: "A) Safezones (Zonas Seguras como Praças, Hospitais e Delegacias)." },
                    { id: 'B', txt: "B) Vielas escuras localizadas atrás da prefeitura civíl." },
                    { id: 'C', txt: "C) Rotas secretas de refino e colheita do ilegal." },
                    { id: 'D', txt: "D) Rodovias desertas fora da área urbana central." }
                ],
                correta: 'A'
            }
        ];

        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

        if (!interaction.client.wlSessoes) {
            interaction.client.wlSessoes = new Map();
        }

        // 🏁 BOTÃO INICIAL
        if (
            interaction.isButton() &&
            interaction.customId === 'iniciar_wl_botao'
        ) {

            if (interaction.client.wlSessoes.has(interaction.user.id)) {
                return interaction.reply({
                    content: '⚠️ **Exame Ativo:** Você já possui um teste de White-List em andamento!',
                    ephemeral: true
                });
            }

            interaction.client.wlSessoes.set(
                interaction.user.id,
                {
                    indiceQuestao: 0,
                    acertos: 0
                }
            );

            await interaction.reply({
                content: '📝 **Exame Inicializado!** O bot carregou o questionário civil na sua tela. Responda abaixo:',
                ephemeral: true
            });

            return dispararQuestaoExame(
                interaction,
                0,
                questaoExame
            );
        }

        // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

        // 🎯 CLIQUE NAS LETRAS A, B, C OU D
        if (
            interaction.isButton() &&
            interaction.customId.startsWith('wl_resp_')
        ) {

            if (!interaction.client.wlSessoes.has(interaction.user.id)) {
                return interaction.reply({
                    content: '❌ **Sessão Expirada:** Seu teste não foi localizado. Inicie novamente no painel!',
                    ephemeral: true
                });
            }

            const sessaoMembro =
                interaction.client.wlSessoes.get(interaction.user.id);

            const partesBotao =
                interaction.customId.split('_');

            const alternativaEscolhida =
                partesBotao[2];

            const numeroQuestaoAtual =
                parseInt(partesBotao[3], 10);

            if (
                numeroQuestaoAtual !==
                sessaoMembro.indiceQuestao
            ) {
                return interaction.reply({
                    content: '⚠️ Por favor, responda apenas à pergunta ativa na sua tela.',
                    ephemeral: true
                });
            }

            const perguntaDados =
                questaoExame[numeroQuestaoAtual];

            if (
                alternativaEscolhida ===
                perguntaDados.correta
            ) {
                sessaoMembro.acertos += 1;
            }

            sessaoMembro.indiceQuestao += 1;

            // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
            // 🏁 FIM DO EXAME
            // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

            if (
                sessaoMembro.indiceQuestao >=
                questaoExame.length
            ) {

                const totalAcertosConcluidos =
                    sessaoMembro.acertos;

                const aprovadoNoTeste =
                    totalAcertosConcluidos >= 4;

                interaction.client.wlSessoes.delete(
                    interaction.user.id
                );

                // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
                // 🟩 APROVADO
                // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

                if (aprovadoNoTeste) {

                    const memberServidor =
                        await interaction.guild.members
                            .fetch(interaction.user.id)
                            .catch(() => null);

                    if (memberServidor) {

                        try {
                            await memberServidor.roles.remove(
                                CARGO_COM_ID
                            );

                            console.log(
                                '[WL] Cargo com ID removido.'
                            );

                        } catch (e) {
                            console.error(
                                'Falha ao remover cargo com ID:',
                                e
                            );
                        }

                        try {
                            await memberServidor.roles.remove(
                                CARGO_SEM_REGISTRO
                            );

                            console.log(
                                '[WL] Cargo sem registro removido.'
                            );

                        } catch (e) {
                            console.error(
                                'Falha ao remover cargo sem registro:',
                                e
                            );
                        }

                        try {
                            await memberServidor.roles.add(
                                CARGO_REGISTRADO
                            );

                            console.log(
                                '[WL] Cargo Registrado entregue com sucesso!'
                            );

                        } catch (e) {
                            console.error(
                                'Falha ao adicionar cargo registrado:',
                                e
                            );
                        }
                    }

                    // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
                    // 💾 ATUALIZA BANCO DE PASSAPORTES
                    // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

                    if (fs.existsSync(caminhoBancoPassaportes)) {

                        try {

                            let usuariosPassaporte =
                                JSON.parse(
                                    fs.readFileSync(
                                        caminhoBancoPassaportes,
                                        'utf8'
                                    )
                                );

                            let cadastroCidadao =
                                usuariosPassaporte.find(
                                    u =>
                                        u.discordId ===
                                        interaction.user.id
                                );

                            if (cadastroCidadao) {

                                cadastroCidadao.status =
                                    'APROVADO / MORADOR';

                                fs.writeFileSync(
                                    caminhoBancoPassaportes,
                                    JSON.stringify(
                                        usuariosPassaporte,
                                        null,
                                        2
                                    )
                                );
                            }

                        } catch (e) {
                            console.error(
                                '[WL] Erro ao atualizar banco:',
                                e
                            );
                        }
                    }

                    // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

                    const embedAprovado =
                        new EmbedBuilder()
                            .setTitle(
                                '🟩 WHITE-LIST APROVADA — SISTEMA CORE'
                            )
                            .setDescription(
                                `Parabéns ${interaction.user}! O bot avaliou suas respostas e você foi oficialmente **APROVADO**!\n\n` +
                                `📈 **Resultado Final:** \`${totalAcertosConcluidos} de 7 Acertos\`\n\n` +
                                `🏅 Seus cargos de identificação temporários foram removidos e as salas de morador oficial da cidade foram liberadas!`
                            )
                            .setColor('#00ff00');

                    if (
                        URL_FOTO_WL &&
                        URL_FOTO_WL.startsWith('http')
                    ) {
                        embedAprovado.setImage(
                            URL_FOTO_WL
                        );
                    }

                    // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
                    // 📋 LOG
                    // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

                    try {

                        const cLogWl =
                            await interaction.guild.channels.fetch(
                                CANAL_LOG_WL
                            );

                        await cLogWl.send({
                            content:
                                `🟩 **WL Automática:** O cidadão ${interaction.user} passou no exame com \`${totalAcertosConcluidos}/7 acertos\` e ganhou o cargo registrado.`
                        });

                    } catch (e) {
                        console.error(
                            '[WL] Erro ao enviar log:',
                            e
                        );
                    }

                    return interaction.update({
                        embeds: [embedAprovado],
                        components: []
                    });
                }

                // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
                // 🟥 REPROVADO
                // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

                const embedReprovado =
                    new EmbedBuilder()
                        .setTitle(
                            '🟥 WHITE-LIST REPROVADA — SISTEMA CORE'
                        )
                        .setDescription(
                            `Ih, que pena ${interaction.user}! Você foi **REPROVADO** por insuficiência de pontos.\n\n` +
                            `📈 **Seu Placar:** \`${totalAcertosConcluidos} de 7 Acertos\` (Mínimo exigido: 4).\n\n` +
                            `📚 Tente novamente clicando no botão verde do painel inicial!`
                        )
                        .setColor('#ff0000');

                if (
                    URL_FOTO_WL &&
                    URL_FOTO_WL.startsWith('http')
                ) {
                    embedReprovado.setImage(
                        URL_FOTO_WL
                    );
                }

                return interaction.update({
                    embeds: [embedReprovado],
                    components: []
                });
            }

            // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
            // ➡️ PRÓXIMA QUESTÃO
            // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

            const proximaQuestao =
                questaoExame[
                    sessaoMembro.indiceQuestao
                ];

            const embedProximaQuestao =
                new EmbedBuilder()
                    .setTitle(
                        `📝 EXAME DE WHITE-LIST — QUESTÃO ${sessaoMembro.indiceQuestao + 1}/7`
                    )
                    .setDescription(
                        `**${proximaQuestao.titulo}**\n\n` +
                        proximaQuestao.opcoes
                            .map(o => o.txt)
                            .join('\n')
                    )
                    .setColor('#ffaa00')
                    .setFooter({
                        text: 'Gueto RP EXAM Core v4 — Correção 100% Automatizada'
                    });

            const botoesProximaQuestao =
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(
                                `wl_resp_A_${sessaoMembro.indiceQuestao}`
                            )
                            .setLabel('A')
                            .setStyle(ButtonStyle.Primary),

                        new ButtonBuilder()
                            .setCustomId(
                                `wl_resp_B_${sessaoMembro.indiceQuestao}`
                            )
                            .setLabel('B')
                            .setStyle(ButtonStyle.Primary),

                        new ButtonBuilder()
                            .setCustomId(
                                `wl_resp_C_${sessaoMembro.indiceQuestao}`
                            )
                            .setLabel('C')
                            .setStyle(ButtonStyle.Primary),

                        new ButtonBuilder()
                            .setCustomId(
                                `wl_resp_D_${sessaoMembro.indiceQuestao}`
                            )
                            .setLabel('D')
                            .setStyle(ButtonStyle.Primary)
                    );

            return interaction.update({
                embeds: [embedProximaQuestao],
                components: [botoesProximaQuestao]
            });
        }
    }
};

// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
// 📝 PRIMEIRA QUESTÃO — EPHEMERAL
// ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

async function dispararQuestaoExame(
    interac,
    index,
    questaoExame
) {

    const dadosQuestao =
        questaoExame[index];

    const embedQuestao =
        new EmbedBuilder()
            .setTitle(
                `📝 EXAME DE WHITE-LIST — QUESTÃO ${index + 1}/7`
            )
            .setDescription(
                `**${dadosQuestao.titulo}**\n\n` +
                dadosQuestao.opcoes
                    .map(o => o.txt)
                    .join('\n')
            )
            .setColor('#ffaa00')
            .setFooter({
                text: 'Gueto RP EXAM Core v4 — Correção 100% Automatizada'
            });

    const botoesAlternativas =
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`wl_resp_A_${index}`)
                    .setLabel('A')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId(`wl_resp_B_${index}`)
                    .setLabel('B')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId(`wl_resp_C_${index}`)
                    .setLabel('C')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId(`wl_resp_D_${index}`)
                    .setLabel('D')
                    .setStyle(ButtonStyle.Primary)
            );

    return interac.followUp({
        embeds: [embedQuestao],
        components: [botoesAlternativas],
        ephemeral: true
    });
}