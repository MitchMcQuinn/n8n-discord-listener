// TypeScript interfaces for the Discord n8n Listener Bot

export interface BotConfig {
  discordBotToken: string;
  n8nWebhookUrl: string;
  filtersConfigPath: string;
  logLevel: string;
}

export interface MessageFilters {
  channels?: {
    whitelist?: string[];
    blacklist?: string[];
  };
  users?: {
    whitelist?: string[];
    blacklist?: string[];
  };
  content?: {
    keywords?: string[];
    regex?: string[];
    ignoreBots?: boolean;
    ignoreDMs?: boolean;
  };
}

export interface DiscordMessageData {
  messageId: string;
  channelId: string;
  authorId: string;
  authorUsername: string;
  content: string;
  timestamp: string;
  guildId: string | null;
  channelName?: string;
  guildName?: string;
}

export interface LogLevel {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
}
