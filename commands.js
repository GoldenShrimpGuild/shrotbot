import 'dotenv/config';
import { capitalize, InstallGlobalCommands } from './utils.js';

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
};

const CMD_AVAILABLE = {
  name: 'available',
  description: 'Reports the available slots for current SYNTHON!',
  type: 1,
};

const ALL_COMMANDS = [TEST_COMMAND, CMD_AVAILABLE];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
