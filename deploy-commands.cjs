//From https://discordjs.guide/creating-your-bot/command-deployment.html#guild-commands
//Using cjs to leave require from example intact; also tweaked to use dotenv
//Note this doesn't have functionality created earlier in utils.js to delete commands to force
//recreation ATM.  Doubtful that it "fully refreshes" as stated, but we'll see, I guess.
require('dotenv').config()

const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

//const { clientId, guildId, token } = require('./config.json');
const token = process.env.DISCORD_TOKEN;
const guildId = process.env.SERVER_ID;
const clientId = process.env.APP_ID;

const commands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

async function loadCommands() {
    for (const folder of commandFolders) {
        // Grab all the command files from the commands directory you created earlier
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            //const command = require(filePath);
            //ugh - interoperability of ESM and CommonJs hurts my peepee
            const command = await import(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
    await loadCommands();
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();
