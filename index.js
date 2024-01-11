import 'dotenv/config';
import { Client, Events, GatewayIntentBits, Collection } from 'discord.js';

import fs from 'fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.commands = new Collection();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadCommands(client) {
    const foldersPath = path.join(__dirname, 'commands');

    try {
        const commandFolders = await fs.readdir(foldersPath);

        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = (await fs.readdir(commandsPath))
                .filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const modulePath = new URL(filePath, `file://${__dirname}/`).href;

                try {
                    const command = await import(modulePath);
                    if ('data' in command && 'execute' in command) {
                        client.commands.set(command.data.name, command);
                    } else {
                        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                    }
                } catch (error) {
                    console.error(`Error loading command at ${filePath}:`, error);
                }
            }
        }
    } catch (error) {
        console.error('Error loading command folders:', error);
    }
}

// Usage
// Assuming `client` is your Discord client instance
loadCommands(client).then(() => {
    console.log('All commands loaded');
}).catch(error => {
    console.error('Failed to load commands:', error);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
