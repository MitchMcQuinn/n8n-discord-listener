import { loadConfig } from './config.js';
import { createBot, startBot, setupGracefulShutdown } from './bot.js';
import { setDefaultResultOrder } from 'node:dns';

// Prefer IPv4 first to avoid IPv6-related stalls on some networks
try {
  setDefaultResultOrder('ipv4first');
} catch {
  // ignore if not supported on this Node version
}

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
  // Avoid crashing on transient network errors; log and keep running.
  // If a truly fatal error occurs, the process may still be unstable, but
  // this favors resiliency for intermittent connectivity blips.
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the application
main().catch((error) => {
  console.error('❌ Application error:', error);
  process.exit(1);
});
