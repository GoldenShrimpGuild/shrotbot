import 'dotenv/config';
import fetch from 'node-fetch';
import { verifyKey } from 'discord-interactions';
import _ from 'lodash';

export function VerifyDiscordRequest(clientKey) {
  return function (req, res, buf, encoding) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send('Bad request signature');
      throw new Error('Bad request signature');
    }
  };
}

export async function DiscordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads
  if (options && options.body) options.body = JSON.stringify(options.body);
  // Use node-fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'Shrotbot (https://github.com/GoldenShrimpGuild/shrotbot, 0.0.1)',
    },
    ...options
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export async function InstallGlobalCommands(appId, commands) {
  return InstallCommands(appId, '', commands);
}

export async function InstallGuildCommands(appId, guildId, commands) {
  return InstallCommands(appId, guildId, commands);
}

export async function InstallCommands(appId, guildId, commands) {
  // API endpoint to overwrite global commands (register as guild command is guildId (server id) specified)
  const endpoint = guildId ? `applications/${appId}/guilds/${guildId}/commands`: `applications/${appId}/commands`;

  try {
    console.log('Installing commands: ' + _.map(commands, (c)=>{return c.name}).join(', ') );
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    let res = await DiscordRequest(endpoint, { method: 'PUT', body: commands });
    console.debug('Response: ' + JSON.stringify(await res.json()));
  } catch (err) {
    console.error(err);
  }
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

//since discord upserts new commands and doesn't appear to remove ones omitted from a list of posted commands, this
//utility method aids in the removal of all commands before registering
export async function DeleteAllCommands(appId, guildId) {
  //retrieve commands first, then delete all of them
  const globalGetEndpoint = `applications/${appId}/commands`;
  const guildGetEndpoint = `applications/${appId}/guilds/${guildId}/commands`;
  const globalDeleteEndpoint = `applications/${appId}/commands/`; //append command id here
  const guildDeleteEndpoint = `applications/${appId}/guilds/${guildId}/commands`; //append command id here

  try {
    console.log('Retrieving global commands...');
    let res = await DiscordRequest(globalGetEndpoint);
    let globalCmds = await res.json(); //promise, promise, promise, promise, promise holy shit
    console.debug('Response: ' + JSON.stringify(globalCmds));

    for(let cmd of globalCmds) {
      await DiscordRequest(globalDeleteEndpoint + '/' + cmd.id, { method: 'DELETE' });
    }

    console.log('Retrieving guild commands...');
    res = await DiscordRequest(guildGetEndpoint);
    let guildCmds = await res.json();
    console.debug('Response: ' + JSON.stringify(guildCmds));

    for(let cmd of guildCmds) {
      await DiscordRequest(guildDeleteEndpoint + '/' + cmd.id, { method: 'DELETE'} );
    }
  } catch (err) {
    console.error(err);
  }
}
