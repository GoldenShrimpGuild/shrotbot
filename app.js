import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, DiscordRequest } from './utils.js';
import { Schedule } from './schedule.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'test') { //KDM - I don't really like how this isn't tied to commands.js in any way
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Hello, shramp! 🦐',
        },
      });
    } else if(name === 'available') {
      //simple POC from static schedule data
      let message = 'No slots appear to be available at this time.';
      let availableSlots = Schedule.getAvailableSlots();
      //KDM: this be ugly
      if(availableSlots.length > 0) {
        message = 'The following slots appear to be available:\n';
        for (const aSlot of availableSlots) {
          message += "Start Time: " + aSlot.startTime + '\n';
          message += "End Time: " + aSlot.endTime + '\n';
          message += "Stage/Raid Train: " + aSlot.raidTrain + '\n';
        }
      }
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: message
        }
      });
    }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
