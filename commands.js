import 'dotenv/config';
import {capitalize, DeleteAllCommands, InstallGlobalCommands, InstallGuildCommands} from './utils.js';

const CMD_TEST = {
  name: 'test',
  description: 'Basic command',
  type: 1,
};

const CMD_SYNTHON = {
  name: 'synthon',
  description: 'SYNTHON! scheduling commands',
  type: 1,
  required: true,
  options: [
    {
      name: 'now',
      description: "Displays who's playing now",
      type: 1
    },
    {
      name: 'available',
      description: 'Reports the available slots for current SYNTHON!',
      type: 1,
    },
    {
      name: 'me',
      description: 'Informs shramp of their SYNTHON! reservations.',
      type: 1,
    },
    {
      name: 'cancel',
      description: 'Allows shramp to disappoint the world by cancelling their SYNTHON! slot.',
      type: 1,
    },
    {
      name: 'trade',
      description: 'Allows two shramp to trade their SYNTHON! slots.',
      type: 1,
    },
    {
      name: 'signup',
      description: "Let's a shramp reserve an available SYNTHON! slot.",
      type: 1,
    },
    {
      name: 'confirm',
      description: 'An administrative command to let Mantis shramp approve of shrimptivities.',
      type: 1,
    },
  ]
};

//Note: consider wrapping some of these in a /synthon command or something w/ the commands above showing up as selectable
//      choices
const ALL_COMMANDS = [CMD_TEST, CMD_SYNTHON];

//InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);

//A guild = a server in discord confuspeak, with the guild/server id accessible by enabling developer mode in advanced
//application settings, right clicking the server name and "copy server id".  Installing commands directly to a guild
//are instantly accessible whereas global commands are cached and may not show up for some time (like an hour+).
//see: https://support.discord.com/hc/en-us/articles/206346498
//     https://discord.com/developers/docs/interactions/application-commands
//
//TODO CL arg to designate registering guild vs global commands
//await DeleteAllCommands(process.env.APP_ID, process.env.SERVER_ID);
InstallGuildCommands(process.env.APP_ID, process.env.SERVER_ID, ALL_COMMANDS);
