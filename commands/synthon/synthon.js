import { SlashCommandBuilder } from 'discord.js';
import { Schedule } from '../../schedule.js';
import { DateTime } from 'luxon';
import {InteractionResponseType} from "discord-interactions";

function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
};

//TODO was hoping to split subcommands out into separate files, but that will require some changes to
//command loading in index.js
//
//Note: reasoning for subcommand use in first place as simply to logically nest commands under a root
//      synthon command for removal of clutter, but presently discord presents all subcommands in flat
//      slash command autocomplete list anyway :/
export const data = new SlashCommandBuilder()
    .setName('synthon')
    .setDescription('SYNTHON! scheduling commands')
    .addSubcommand(subcommand =>
        subcommand
            .setName('now')
            .setDescription('Displays who\'s playing now')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('available')
            .setDescription('Reports the available slots for current SYNTHON!')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('me')
            .setDescription('Informs shramp of their SYNTHON! reservations.')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('cancel')
            .setDescription('Allows shramp to disappoint the world by cancelling their SYNTHON! slot.')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('trade')
            .setDescription('Allows two shramp to trade their SYNTHON! slots.')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('signup')
            .setDescription('Let\'s a shramp reserve an available SYNTHON! slot.')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('confirm')
            .setDescription('An administrative command to let Mantis shramp approve of shrimptivities.')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('when')
            .setDescription('Determine when given artist(s) are playing.')
            .addStringOption(option => //TODO if/when we have mapping of discord user to twitch name, make proper discord user type vs. string
                option.setName('artist') //   we could attempt to just see if the names match and then follow up w/ a separate prompt, but KISS for now
                    .setDescription('Name of the artist')
                    .setRequired(true))
    );

function formatSchedule(slots) {
    let message = 'Start Time: \t\t\t\t Raid Train:\n';
    for (const aSlot of slots) {
        let dt = DateTime.fromFormat(aSlot.startTime, 'yyyy-MM-dd HH:mm', {zone: Schedule.getTimezone()});
        message += `<t:${dt.toUnixInteger()}:f> \t${aSlot.raidTrain}\n`;
    }
    return message;
}

export async function execute(interaction) {
    //too bad subcommands don't get their own execute methods :(
    //for now we deal w/ this, but Shirley another solution awaits
    if (interaction.options.getSubcommand()) {
        switch (interaction.options.getSubcommand()) {
            case 'now':
                await interaction.reply({content: 'Not yet implemented', ephemeral: true});
                break;
            case 'available': {
                //atm this will respond quickly, but when we actually retrieve the schedule
                //via a separate fetch, etc., we will want to add a deferred response so go
                //ahead and simulate that here for time being w/ short timeout
                await interaction.deferReply({ephemeral: true});
                await sleep(2000);

                //simple POC from static schedule data
                let message = 'No slots appear to be available at this time.';
                let availableSlots = Schedule.getAvailableSlots();
                if (availableSlots.length > 0) {
                    message = 'The following slots appear to be available:\n';
                    message += formatSchedule(availableSlots);
                }
                await interaction.editReply({content: message, ephemeral: true});
                break;
            }
            case 'me':
                await interaction.reply({content: 'Not yet implemented', ephemeral: true});
                break;
            case 'cancel':
                await interaction.reply({content: 'Not yet implemented', ephemeral: true});
                break;
            case 'trade':
                await interaction.reply({content: 'Not yet implemented', ephemeral: true});
                break;
            case 'signup':
                await interaction.reply({content: 'Not yet implemented', ephemeral: true});
                break;
            case 'confirm':
                await interaction.reply({content: 'Not yet implemented', ephemeral: true});
                break;
            case 'when': {
                let artistName = interaction.options.getString('artist');
                let schedule = Schedule.getArtistSlots(artistName);
                let message = '';
                if(schedule.length > 0) {
                    message = `${artistName} appears as follows:\n`;
                    message += formatSchedule(schedule);
                } else {
                    message = `${artistName} doesn't appear to scheduled.  Please double-check the name.`;
                }
                await interaction.reply({content: message, ephemeral: true});
                break;
            }
            default:
                await interaction.reply({content: 'Error: unknown subcommand.', ephemeral: true});
        }
    } else {
        await interaction.reply("Error: missing subcommand.");
    }
}
