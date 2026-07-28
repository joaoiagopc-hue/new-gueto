const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    async executePrefixPainel(message) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const embedSeguranca = new EmbedBuilder()
            .setTitle('🧱 GUETO RP • Armadilha Anti-Scam')
            .setDescription(
                `Canal protegido: <#${message.channel.id}>\n\n` +
                'Sistema ativo para bloquear contas que enviam divulgação de **servidor pornográfico/+18**, golpes de **hack**, falso **MrBeast**, **free Nitro/Robux**, token grabber e imagens suspeitas.\n\n' +
                '┃ Qualquer mensagem enviada neste canal será **apagada automaticamente**.\n' +
                '┃ Mensagem troll/comum recebe **warn + mute de 10 minutos**.\n' +
                '┃ Divulgação +18, scam, hack, falso MrBeast, free Nitro/Robux ou token grabber recebe **mute de 7 dias**.\n' +
                '┃ Se for erro, o membro recebe aviso na DM para chamar um administrador no privado.\n\n' +
                '✅ **Verificações ativas:** texto, links, convites Discord, nome de arquivo e imagens suspeitas.\n' +
                '🚫 **Punições graves:** 11\n' +
                '🟨 **Trolls punidos:** 171\n' +
                '*GUETO RP — Armadilha System*'
            )
            .setColor('#2f3136');

        const botaoRodape = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('botao_fake_status_armadilha')
                .setLabel('🚫 Punidas: 11 | Trolls: 171')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true)
        );

        try { await message.delete().catch(() => null); } catch (e) {}
        await message.channel.send({ embeds: [embedSeguranca], components: [botaoRodape] });
    },

    async executeArmadilha(message) {
        const CONFIG_ARMADILHA = {
          CANAL_ARMADILHA_ID: '1531417155936194690', // 🚨 ID do seu canal armadilha
            CANAL_LOGS_STAFF_ID: '1506593481513111563', // 🚨 ID da sala de logs da Staff
            SEU_ID_DO_DISCORD: '1519493835904909386'  // ⚙️ COLOQUE SEU ID DO DISCORD PARA POSTAR AVISOS SEM TOMAR BAN
        };

        if (message.channel.id !== CONFIG_ARMADILHA.CANAL_ARMADILHA_ID) return;
        if (message.author.bot) return;

        if (message.content.trim() === '!painel-armadilha') return;
        if (message.author.id === CONFIG_ARMADILHA.SEU_ID_DO_DISCORD) return;

        if (message.member && message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            try { return await message.delete().catch(() => null); } catch (e) { return; }
        }

        const tagInvasor = message.author.tag;
        const idInvasor = message.author.id;
        const textoEnviado = message.content || '[Sem conteúdo de texto]';
        const servidor = message.guild;

        try { await message.delete().catch(() => null); } catch (err) {}

        try {
            await servidor.members.ban(idInvasor, { 
                reason: '🚨 [ESCUDO ANTI-RAID] Invasão: Quebra do aviso de segurança no canal armadilha.' 
            });

            const embedAlertaLogs = new EmbedBuilder()
                .setTitle('🛡️ ─── ESCUDO ANTI-RAID ATIVADO ─── 🛡️')
                .setDescription(`⚠️ **Aviso Crítico:** Invasor neutralizado no canal armadilha monitorado!`)
                .setColor('#2f3136')
                .addFields([
                    { name: '👤 USUÁRIO BANIDO', value: `\`\`\`fix\n${tagInvasor}\n\`\`\``, inline: true },
                    { name: '🆔 ID DO ACUSADO', value: `\`\`\`yaml\n${idInvasor}\n\`\`\``, inline: true },
                    { name: '💬 TEXTO CAPTURADO', value: `\`\`\`md\n> ${textoEnviado}\n\`\`\``, inline: false },
                    { name: '📌 AÇÃO ADMINISTRATIVA', value: `\`\`\`diff\n- BANIMENTO PERMANENTE APLICADO POR IP\n\`\`\``, inline: false }
                ])
                .setTimestamp();

            const canalLogsStaff = servidor.channels.cache.get(CONFIG_ARMADILHA.CANAL_LOGS_STAFF_ID);
            if (canalLogsStaff && CONFIG_ARMADILHA.CANAL_LOGS_STAFF_ID !== '123456789012345678') {
                await canalLogsStaff.send({ embeds: [embedAlertaLogs] }).catch(() => null);
            }
        } catch (erroBan) { console.error(erroBan); }
    }
};
