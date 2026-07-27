const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    // ⚙️ Função que envia a embed oficial de segurança via prefixo !painel-armadilha
    async executePrefixPainel(message) {
        // Trava para garantir que apenas Administradores possam acionar o painel
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const embedSeguranca = new EmbedBuilder()
            .setTitle('🛡️ SISTEMA DE SEGURANÇA E MONITORAMENTO | GUETO RP')
            .setDescription(
                '🔴 **ATENÇÃO CIDADÃOS E VISITANTES:**\n\n' +
                'Este canal está integrado ao nosso **Escudo Anti-Raid de Alta Defesa**.\n' +
                'A sala está sendo monitorada 24 horas por dia por algoritmos de proteção contra scripts maliciosos, invasões e contas fakes.\n\n' +
                '⚠️ **DIRETRIZ DE SEGURANÇA MÁXIMA:**\n' +
                '• **NÃO DIGITE ABSOLUTAMENTE NADA NESTE CANAL.**\n' +
                '• Qualquer caractere, símbolo ou mensagem enviada aqui acionará o **BANIMENTO AUTOMÁTICO E PERMANENTE POR IP** do servidor.\n' +
                '• Humildemente pedimos que respeite o aviso para não perder o seu passaporte!'
            )
            .setColor('#0000ff') // Azul Oficial do Gueto RP
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'Gueto RP • Protocolo Militar Anti-Raid Ligado' })
            .setTimestamp();

        try { await message.delete(); } catch (e) {} // Apaga o "!painel-armadilha" digitado
        await message.channel.send({ embeds: [embedSeguranca] });
    },

    // 🔒 Lógica mestre que escuta o canal e pune os invasores
    async executeArmadilha(message) {
        const CONFIG_ARMADILHA = {
          CANAL_ARMADILHA_ID: '1531417155936194690', // 🚨 ID do seu canal armadilha
            CANAL_LOGS_STAFF_ID: '1506593481513111563', // 🚨 ID da sala de logs da Staff
            SEU_ID_DO_DISCORD: '1519493835904909386' // ⚙️ Seu ID para você postar avisos sem tomar ban
        };

        if (message.channel.id !== CONFIG_ARMADILHA.CANAL_ARMADILHA_ID) return;
        if (message.author.bot) return;

        // Se a mensagem for o próprio comando de ativação, deixa passar (a função de cima vai tratar)
        if (message.content.trim() === '!painel-armadilha') return;

        // Trava mestre: se for você digitando o seu aviso pessoal, o bot deixa passar e não faz nada
        if (message.author.id === CONFIG_ARMADILHA.SEU_ID_DO_DISCORD) return;

        // Se for qualquer outro administrador real digitando sem querer, apenas limpa o chat e não bane
        if (message.member && message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            try { return await message.delete(); } catch (e) { return; }
        }

        const tagInvasor = message.author.tag;
        const idInvasor = message.author.id;
        const textoEnviado = message.content || '[Sem conteúdo de texto]';
        const servidor = message.guild;

        try { await message.delete(); } catch (err) {}

        try {
            // Aplica o banimento por IP permanente na hora
            await servidor.members.ban(idInvasor, { 
                reason: '🚨 [ESCUDO ANTI-RAID] Invasão: Quebra do aviso de segurança no canal armadilha.' 
            });

            const embedAlertaLogs = new EmbedBuilder()
                .setTitle('🛡️ ─── ESCUDO ANTI-RAID ATIVADO ─── 🛡️')
                .setDescription(`⚠️ **Aviso Crítico:** Invasor neutralizado no canal armadilha monitorado!`)
                .setColor('#0000ff')
                .addFields([
                    { name: '👤 USUÁRIO BANIDO', value: `\`\`\`fix\n${tagInvasor}\n\`\`\``, inline: true },
                    { name: '🆔 ID DO ACUSADO', value: `\`\`\`yaml\n${idInvasor}\n\`\`\``, inline: true },
                    { name: '💬 TEXTO CAPTURADO', value: `\`\`\`md\n> ${textoEnviado}\n\`\`\``, inline: false },
                    { name: '📌 AÇÃO ADMINISTRATIVA', value: `\`\`\`diff\n- BANIMENTO PERMANENTE APLICADO POR IP\n\`\`\``, inline: false }
                ])
                .setTimestamp();

            const canalLogsStaff = servidor.channels.cache.get(CONFIG_ARMADILHA.CANAL_LOGS_STAFF_ID);
            if (canalLogsStaff && CONFIG_ARMADILHA.CANAL_LOGS_STAFF_ID !== '123456789012345678') {
                await canalLogsStaff.send({ content: '🚨 **ALERTA DE SEGURANÇA!** Invasor banido.', embeds: [embedAlertaLogs] });
            }
        } catch (erroBan) {
            console.error('[ARMADILHA] Falha ao banir:', erroBan);
        }
    }
};
