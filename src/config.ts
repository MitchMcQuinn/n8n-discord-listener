import { config } from 'dotenv';
import { BotConfig } from './types.js';

// Load environment variables
config();

export function loadConfig(): BotConfig {
  const discordBotToken = process.env.DISCORD_BOT_TOKEN;
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  
  if (!discordBotToken) {
    throw new Error('DISCORD_BOT_TOKEN environment variable is required');
  }
  
  if (!n8nWebhookUrl) {
    throw new Error('N8N_WEBHOOK_URL environment variable is required');
  }

  return {
    discordBotToken,
    n8nWebhookUrl,
    filtersConfigPath: process.env.FILTERS_CONFIG_PATH || 'config/filters.json',
    logLevel: process.env.LOG_LEVEL || 'info'
  };
}
