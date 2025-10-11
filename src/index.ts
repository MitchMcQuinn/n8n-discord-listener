import { loadConfig } from './config.js';
import { createBot, startBot, setupGracefulShutdown } from './bot.js';

async function main(): Promise<void> {
  try {
    console.log('🎯 Starting Discord n8n Listener Bot...');
    
    // Load configuration
    const config = loadConfig();
    console.log('✅ Configuration loaded successfully');
    
    // Create and start bot
    const bot = createBot(config);
    setupGracefulShutdown(bot);
    
    await startBot(bot, config);
    
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the application
main().catch((error) => {
  console.error('❌ Application error:', error);
  process.exit(1);
});
