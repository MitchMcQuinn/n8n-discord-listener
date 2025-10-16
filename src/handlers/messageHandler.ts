import { Message } from 'discord.js';
import { BotConfig, DiscordMessageData } from '../types.js';
import { evaluateFilters } from './filterHandler.js';
import axios from 'axios';

export async function handleMessage(message: Message, config: BotConfig): Promise<void> {
  // Skip if message is from a bot (unless configured otherwise)
  if (message.author.bot) {
    console.log(`🤖 Skipping bot message from ${message.author.username}`);
    return;
  }

  // Skip if message is a DM (unless configured otherwise)
  if (!message.guild) {
    console.log(`💬 Skipping DM from ${message.author.username}`);
    return;
  }

  const channelName = message.channel.isTextBased() && 'name' in message.channel ? message.channel.name : 'unknown';
  console.log(`📨 Message received from ${message.author.username} in #${channelName}`);

  try {
    // Load and evaluate filters
    const shouldProcess = await evaluateFilters(message, config.filtersConfigPath);
    
    if (!shouldProcess) {
      console.log(`🚫 Message filtered out from ${message.author.username}`);
      return;
    }

    console.log(`✅ Message passed filters from ${message.author.username}`);

    // Debug: Log reference information
    console.log(`🔍 Message reference debug:`, {
      hasReference: !!message.reference,
      reference: message.reference,
      messageId: message.reference?.messageId,
      referenceType: message.reference?.type,
      messageContent: message.content,
      messageType: message.type,
      isReply: message.type === 19 // 19 is the REPLY message type
    });

    // Prepare message data for n8n
    const messageData: DiscordMessageData = {
      messageId: message.id,
      channelId: message.channel.id,
      authorId: message.author.id,
      authorUsername: message.author.username,
      content: message.content,
      timestamp: message.createdAt.toISOString(),
      guildId: message.guild?.id,
      channelName: message.channel.isTextBased() && 'name' in message.channel ? (message.channel.name || undefined) : undefined,
      guildName: message.guild?.name,
      referencedMessageId: message.reference?.messageId,
      referencedMessageType: message.reference?.type?.toString()
    };

    // Debug: Log the exact data being sent to n8n
    console.log(`📤 Sending to n8n:`, JSON.stringify(messageData, null, 2));

    // Send to n8n webhook
    await sendToN8n(messageData, config.n8nWebhookUrl);
    
    console.log(`📤 Message forwarded to n8n webhook`);

  } catch (error) {
    console.error('❌ Error processing message:', error);
  }
}

async function sendToN8n(messageData: DiscordMessageData, webhookUrl: string): Promise<void> {
  try {
    const response = await axios.post(webhookUrl, messageData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    if (response.status >= 200 && response.status < 300) {
      console.log(`✅ Successfully sent message to n8n (status: ${response.status})`);
    } else {
      console.warn(`⚠️ Unexpected response from n8n webhook (status: ${response.status})`);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        console.error('❌ Failed to connect to n8n webhook - is the URL correct?');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('❌ n8n webhook request timed out');
      } else {
        console.error(`❌ n8n webhook error: ${error.message}`);
      }
    } else {
      console.error('❌ Unexpected error sending to n8n:', error);
    }
    throw error;
  }
}
