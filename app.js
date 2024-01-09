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
import { DateTime } from 'luxon';

const MAX_SELECT_ITEMS = 25; //discord only allows this many slots in select menus

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// In test environment, use regular JSON parsing without verification
if (process.env.NODE_ENV !== 'test') {
  // Parse request body and verifies incoming requests using discord-interactions package
  app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));
} else {
  // In test environment, use regular JSON parsing without verification
  app.use(express.json());
}

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
    const { name, options } = data;

    // "test" command
    if (name === 'test') { //KDM - I don't really like how this isn't tied to commands.js in any way
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Hello, shramp! 🦐',
        },
      });
    } else if(name === 'synthon') {
      if(options[0] && options[0].name === 'available') {
        //simple POC from static schedule data
        let message = 'No slots appear to be available at this time.';
        let availableSlots = Schedule.getAvailableSlots();
        //KDM: this be ugly
        if(availableSlots.length > 0) {
          message = 'The following slots appear to be available:\n';
          /*
          for (const aSlot of availableSlots) {
            message += "Start Time: " + aSlot.startTime + '\n';
            message += "Stage/Raid Train: " + aSlot.raidTrain + '\n';
          }
           */
          let opts = [];
          //TODO pagination due to limit of select item length
          for (let i=0; i < (availableSlots.length < MAX_SELECT_ITEMS ? availableSlots.length : MAX_SELECT_ITEMS); i++) {
            let aSlot = availableSlots[i];
            let dt = DateTime.fromFormat(aSlot.startTime, 'yyyy-MM-dd HH:mm',{zone:Schedule.getTimezone()});
            let opt = {
              "label": `Start Time: <t:${dt.toUnixInteger()}:f> ${aSlot.raidTrain}`,
              "value": `slot_${i}`, //it would be much easier to assign IDs to the slot then do everything based on time
                                    //starting w/ an index-based id atm
              "description": `${aSlot.raidTrain} Slot ${i}`,
            };
            opts.push(opt);
          }
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: message,
              "components": [
                {
                  "type": 1,
                  "components": [
                    {
                      "type": 3,
                      "custom_id": "available_select_1", //TODO generate atomic ID when state storage implemented
                      "options": opts,
                      "placeholder": "Choose your desired slots...",
                      "min_values": 1,
                      "max_values": MAX_SELECT_ITEMS, //seem to be outputing slots in 30m increments, regardless...multiple may be desired
                    }
                  ]
                }
              ]
            }
          });
        } else {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: message,
            }
          });
        }
      } else if(options[0] && options[0].name === 'now') {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Not yet implemented',
          },
        });
      } else if(options[0] && options[0].name === 'me') {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Not yet implemented',
          },
        });
      } else if(options[0] && options[0].name === 'cancel') {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Not yet implemented',
          },
        });
      } else if(options[0] && options[0].name === 'trade') {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Not yet implemented',
          },
        });
      } else if(options[0] && options[0].name === 'signup') {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Not yet implemented',
          },
        });
      } else if(options[0] && options[0].name === 'confirm') {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Not yet implemented',
          },
        });
      } else {
        return res.status(400).send('Unknown SYNTHON! subcommand');
      }
    } else {
      return res.status(400).send('Unknown command');
    }
  } else {
    return res.status(400).send('Unknown interaction type or type not found.');
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});

//export for use by chaiHttp
export default app;
