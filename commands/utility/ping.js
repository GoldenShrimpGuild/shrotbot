import { SlashCommandBuilder } from 'discord.js';

//I was under the impression this command is necessary for verification of the bot
//(performed when one adds an interaction endpoint url in discord settings for the bot),
//as this was mentioned briefly in discord docs and also when switching from the discord
//example app express/js paradigm to discord.js as there was a failure updating that url,
//but it turns out simply removing the url worked under discord.js as it appears to open
//a connection during client.login and not require it, so this may not be required, either.
//
//TODO double-check this isn't required and remove it as who wants the clutter in the
//slash command list?
export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');

export async function execute(interaction) {
    await interaction.reply('Pong!');
};
