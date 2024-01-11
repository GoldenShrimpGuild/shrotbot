import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('test')
    .setDescription('Basic command.');

export async function execute(interaction) {
    await interaction.reply({content: 'Hello, shramp! 🦐', ephemeral: true});
}
