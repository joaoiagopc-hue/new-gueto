const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset-total')
        .setDescription('🚨 Limpa TODOS os cargos, nicks de TODOS os membros e dá Sem Registro!')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        // ⚙️ Cole o ID real do cargo Sem Registro entre as aspas na linha abaixo:
        const CARGO_SEM_REGISTRO_ID = '1515730336313512076'; 
        
        await interaction.reply({ content: '🔄 Iniciando faxina geral de temporada nos moradores...', ephemeral: true });

        const membros = await interaction.guild.members.fetch();
        const cargoSemReg = interaction.guild.roles.cache.get(CARGO_SEM_REGISTRO_ID);

        for (const [id, m] of membros) {
            if (m.user.bot) continue;
            
            // 1. Limpa o Apelido (Volta para o original do Discord)
            try { await m.setNickname(null); } catch (e) {}
            
            // 2. Arranca todos os cargos antigos de uma vez só
            const cargos = m.roles.cache.filter(r => r.id !== interaction.guild.id && !r.managed);
            if (cargos.size > 0) {
                try { await m.roles.remove(cargos); } catch (e) {}
            }
            
            // 3. Adiciona a tag Sem Registro na mesma hora
            if (cargoSemReg) {
                try { await m.roles.add(cargoSemReg); } catch (e) {}
            }
        }
        return interaction.followUp({ content: '✅ **Reset concluído!** Todos os nicks foram limpos, cargos removidos e a tag Sem Registro foi aplicada!', ephemeral: true });
    }
};
