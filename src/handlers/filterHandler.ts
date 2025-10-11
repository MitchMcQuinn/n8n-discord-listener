import { Message } from 'discord.js';
import { MessageFilters } from '../../types.js';
import fs from 'fs/promises';
import path from 'path';

export async function evaluateFilters(message: Message, filtersPath: string): Promise<boolean> {
  try {
    // Load filters from JSON file
    const filtersData = await fs.readFile(filtersPath, 'utf-8');
    const filters: MessageFilters = JSON.parse(filtersData);

    // Check channel filters
    if (!checkChannelFilters(message, filters.channels)) {
      return false;
    }

    // Check user filters
    if (!checkUserFilters(message, filters.users)) {
      return false;
    }

    // Check content filters
    if (!checkContentFilters(message, filters.content)) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error loading filters:', error);
    // If filters can't be loaded, allow all messages (fail open)
    return true;
  }
}

function checkChannelFilters(message: Message, channelFilters?: MessageFilters['channels']): boolean {
  if (!channelFilters) return true;

  const channelId = message.channel.id;

  // Check blacklist first
  if (channelFilters.blacklist && channelFilters.blacklist.includes(channelId)) {
    console.log(`🚫 Channel ${channelId} is blacklisted`);
    return false;
  }

  // Check whitelist
  if (channelFilters.whitelist && channelFilters.whitelist.length > 0) {
    if (!channelFilters.whitelist.includes(channelId)) {
      console.log(`🚫 Channel ${channelId} not in whitelist`);
      return false;
    }
  }

  return true;
}

function checkUserFilters(message: Message, userFilters?: MessageFilters['users']): boolean {
  if (!userFilters) return true;

  const userId = message.author.id;

  // Check blacklist first
  if (userFilters.blacklist && userFilters.blacklist.includes(userId)) {
    console.log(`🚫 User ${userId} is blacklisted`);
    return false;
  }

  // Check whitelist
  if (userFilters.whitelist && userFilters.whitelist.length > 0) {
    if (!userFilters.whitelist.includes(userId)) {
      console.log(`🚫 User ${userId} not in whitelist`);
      return false;
    }
  }

  return true;
}

function checkContentFilters(message: Message, contentFilters?: MessageFilters['content']): boolean {
  if (!contentFilters) return true;

  // Check ignore bots setting
  if (contentFilters.ignoreBots && message.author.bot) {
    console.log(`🚫 Ignoring bot message`);
    return false;
  }

  // Check ignore DMs setting
  if (contentFilters.ignoreDMs && !message.guild) {
    console.log(`🚫 Ignoring DM message`);
    return false;
  }

  const content = message.content.toLowerCase();

  // Check keyword filters
  if (contentFilters.keywords && contentFilters.keywords.length > 0) {
    const hasKeyword = contentFilters.keywords.some(keyword => 
      content.includes(keyword.toLowerCase())
    );
    if (!hasKeyword) {
      console.log(`🚫 Message doesn't contain any required keywords`);
      return false;
    }
  }

  // Check regex filters
  if (contentFilters.regex && contentFilters.regex.length > 0) {
    const matchesRegex = contentFilters.regex.some(pattern => {
      try {
        const regex = new RegExp(pattern, 'i');
        return regex.test(content);
      } catch (error) {
        console.warn(`⚠️ Invalid regex pattern: ${pattern}`);
        return false;
      }
    });
    if (!matchesRegex) {
      console.log(`🚫 Message doesn't match any required regex patterns`);
      return false;
    }
  }

  return true;
}
