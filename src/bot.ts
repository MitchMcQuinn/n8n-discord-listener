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

  // Shard lifecycle visibility (helps observe reconnect behavior)
  client.on(Events.ShardReady, (shardId) => {
    console.log(`✅ Shard ${shardId} is ready`);
  });

  client.on(Events.ShardDisconnect, (closeEvent, shardId) => {
    console.warn(`⚠️ Shard ${shardId} disconnected (code ${closeEvent.code}, reason: ${closeEvent.reason || 'n/a'}) - discord.js will attempt to reconnect automatically`);
  });

  client.on(Events.ShardReconnecting, (shardId) => {
    console.log(`🔁 Shard ${shardId} reconnecting...`);
  });

  client.on(Events.ShardResume, (shardId, replayed) => {
    console.log(`📶 Shard ${shardId} resumed (replayed ${replayed} events)`);
  });

  return client;
}

export async function startBot(client: Client, config: BotConfig): Promise<void> {
  // Exponential backoff retry for initial login to ride out transient network issues
  console.log('🚀 Starting Discord bot...');
  let attempt = 0;
  const baseDelayMs = 1000; // 1s
  const maxDelayMs = 60000; // 60s cap

  // Keep retrying until success; discord.js handles reconnections after initial login
  // so this only focuses on getting through the initial gateway handshake
  // without exiting the process on transient failures.
  // Intentionally no hard max attempts; process should keep trying until network is back.
  // If a permanent error occurs (e.g., invalid token), we will log repeatedly; user can stop the process.
  // This favors resiliency over fast-failing.
  //
  // Note: Avoid parallel login calls; we serialize attempts in this loop.
  /* eslint-disable no-constant-condition */
  while (true) {
    try {
      await client.login(config.discordBotToken);
      return; // success
    } catch (error: any) {
      attempt += 1;
      const delay = Math.min(baseDelayMs * 2 ** Math.min(attempt, 6), maxDelayMs);
      const message = error?.message || String(error);
      console.error(`❌ Login attempt ${attempt} failed: ${message}`);
      console.log(`⏳ Retrying in ${Math.round(delay / 1000)}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
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
