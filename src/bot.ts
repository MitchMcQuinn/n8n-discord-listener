import { Client, GatewayIntentBits, Events } from 'discord.js';
import { BotConfig } from './types.js';
import { handleMessage } from './handlers/messageHandler.js';

export function createBot(config: BotConfig): Client {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  // Bot ready event
  client.once(Events.ClientReady, (readyClient) => {
    console.log(`✅ Bot is ready! Logged in as ${readyClient.user.tag}`);
    console.log(`📡 Listening for messages in ${readyClient.guilds.cache.size} guilds`);
  });

  // Message event handler
  client.on(Events.MessageCreate, async (message) => {
    try {
      await handleMessage(message, config);
    } catch (error) {
      console.error('❌ Error handling message:', error);
    }
  });

  // Error handling
  client.on(Events.Error, (error) => {
    console.error('❌ Discord client error:', error);
  });

  // Warning handling
  client.on(Events.Warn, (warning) => {
    console.warn('⚠️ Discord client warning:', warning);
  });

  return client;
}

export async function startBot(client: Client, config: BotConfig): Promise<void> {
  try {
    console.log('🚀 Starting Discord bot...');
    await client.login(config.discordBotToken);
  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

export function setupGracefulShutdown(client: Client): void {
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    
    try {
      await client.destroy();
      console.log('✅ Bot disconnected successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}
