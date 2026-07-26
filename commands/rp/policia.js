const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'painel-policia',
    description: 'Envia o painel com os Altos Cargos das Corporações Policiais',
    async executePrefix(message) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Você não tem permissão para usar este comando.');
        }

        const iconeServidor = message.guild.iconURL({ dynamic: true, size: 512 });

        const embed = new EmbedBuilder()
            .setTitle('🛡️ ─── ALTO COMANDO CORPORATIVO | GUETO RP ─── 🛡️')
            .setDescription(
                '## 👮 — Polícia Militar (PM)\n' +
                '👤 — **Comandante:** :Sv_TickRed:\n\n' +
                '## 🕵️ — Polícia Civil (PC)\n' +
                '👤 — **Delegado-Geral:** :Sv_TickRed:\n\n' +
                '## ☠️ — BOPE\n' +
                '👤 — **Comandante:** :Sv_TickRed:\n\n' +
                '## 🚔 —  Polícia Rodoviária (PRE/PRF)\n' +
                '👤 — **Comandante:** :Sv_TickRed:\n\n' +
                '## 🛡️ — 19° Batalhão de Caçadores (Exército Brasileiro)\n' +
                '👤 — **General:** :Sv_TickRed:'
            )
            .setColor('#0000ff')
            .setThumbnail(iconeServidor)
            .setFooter({ text: 'Gueto RP • Organização Geral de Segurança Pública', iconURL: iconeServidor })
            .setTimestamp();

        try {
            await message.delete();
        } catch (err) { console.log(err); }

        await message.channel.send({ embeds: [embed] });
    }
};
