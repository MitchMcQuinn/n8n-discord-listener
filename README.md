# n8n-discord-listener

A TypeScript Discord bot that listens for messages based on configurable filters and forwards them to n8n workflows via webhooks. Perfect for automating Discord interactions with your n8n workflows.

## 🚀 Features

- **Configurable Message Filtering**: Filter messages by channel, user, keywords, and regex patterns
- **n8n Webhook Integration**: Seamlessly forwards filtered messages to n8n workflows
- **TypeScript Support**: Full type safety and modern JavaScript features
- **Graceful Error Handling**: Robust error handling with detailed logging
- **Sparkedhost Ready**: Optimized for deployment on Sparkedhost hosting

## 📋 Prerequisites

- Node.js 12-22 (recommended: Node.js 18+)
- A Discord Bot Token ([Discord Developer Portal](https://discord.com/developers/applications))
- An n8n instance with webhook capabilities
- Git (for cloning the repository)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd n8n-discord-listener
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DISCORD_BOT_TOKEN=your_discord_bot_token_here
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/discord-listener
   FILTERS_CONFIG_PATH=config/filters.json
   LOG_LEVEL=info
   ```

4. **Configure message filters** (optional)
   
   Edit `config/filters.json` to customize which messages to process:
   ```json
   {
     "channels": {
       "whitelist": ["1234567890123456789"],
       "blacklist": ["9876543210987654321"]
     },
     "users": {
       "whitelist": [],
       "blacklist": []
     },
     "content": {
       "keywords": ["urgent", "help"],
       "regex": ["^!command", ".*@everyone.*"],
       "ignoreBots": true,
       "ignoreDMs": true
     }
   }
   ```

## 🚀 Running the Bot

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DISCORD_BOT_TOKEN` | ✅ | Your Discord bot token | - |
| `N8N_WEBHOOK_URL` | ✅ | n8n webhook URL endpoint | - |
| `FILTERS_CONFIG_PATH` | ❌ | Path to filters configuration | `config/filters.json` |
| `LOG_LEVEL` | ❌ | Logging level (error, warn, info, debug) | `info` |

### Filter Configuration

The `config/filters.json` file allows you to configure which messages the bot should process:

#### Channel Filters
- **whitelist**: Array of channel IDs to process (empty = all channels)
- **blacklist**: Array of channel IDs to ignore

#### User Filters
- **whitelist**: Array of user IDs to process (empty = all users)
- **blacklist**: Array of user IDs to ignore

#### Content Filters
- **keywords**: Array of keywords that must be present in the message
- **regex**: Array of regex patterns that must match the message content
- **ignoreBots**: Whether to ignore messages from bot accounts
- **ignoreDMs**: Whether to ignore direct messages

## 🔗 n8n Integration

### Setting up the Webhook

1. **Create a Webhook Node** in your n8n workflow
2. **Configure the webhook**:
   - Method: POST
   - Path: `/discord-listener` (or your preferred path)
   - Authentication: None (or configure as needed)

3. **Test the webhook** by sending a test message in Discord

### Webhook Payload

The bot sends the following JSON payload to your n8n webhook:

```json
{
  "messageId": "1234567890123456789",
  "channelId": "9876543210987654321",
  "authorId": "1111111111111111111",
  "authorUsername": "username",
  "content": "Hello world!",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "guildId": "2222222222222222222",
  "channelName": "general",
  "guildName": "My Server",
  "referencedMessageId": "1234567890123456788",
  "referencedMessageType": "0"
}
```

**Field Descriptions:**
- `referencedMessageId`: The ID of the message being referenced (if this message is a reply or quote)
- `referencedMessageType`: The type of reference (0 = reply, 1 = quote, etc.)

### Replying to Messages

To reply to Discord messages from your n8n workflow:

1. **Add a Discord Node** to your workflow
2. **Configure the Discord Node**:
   - Operation: Send Message
   - Channel: Use the `channelId` from the webhook payload
   - Message: Your response content
3. **Use the same bot token** that the listener bot uses

## 🚀 Deployment on Sparkedhost

### Method 1: GitHub Integration (Recommended)

#### 1. Connect GitHub Repository to Sparkedhost

1. **Log into your Sparkedhost control panel**
2. **Navigate to your Node.js application**
3. **Go to "Deployments" or "Git" section**
4. **Connect your GitHub repository:**
   - Click "Connect GitHub" or "Link Repository"
   - Authorize Sparkedhost to access your GitHub account
   - Select your `n8n-discord-listener` repository
   - Choose the branch (usually `main` or `master`)

#### 2. Configure Build Settings

In your Sparkedhost control panel:

1. **Set Build Command:**
   ```bash
   npm run build
   ```

2. **Set Start Command:**
   ```bash
   npm start
   ```

3. **Set Node.js Version:**
   - Choose Node.js 18 or 20 (recommended)
   - Ensure compatibility with your project

#### 3. Configure Environment Variables

In your Sparkedhost control panel:

1. **Go to "Environment Variables" or "Config" section**
2. **Add the following variables:**
   ```
   DISCORD_BOT_TOKEN=your_actual_discord_bot_token
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/discord-listener
   FILTERS_CONFIG_PATH=config/filters.json
   LOG_LEVEL=info
   NODE_ENV=production
   ```

#### 4. Deploy

1. **Click "Deploy" or "Redeploy"**
2. **Monitor the build logs** for any errors
3. **Check the application logs** to ensure the bot starts successfully

### Method 2: Manual Upload

#### 1. Prepare Your Application Locally

```bash
# Build the application
npm run build

# Create deployment package
tar -czf discord-bot.tar.gz dist/ config/ package.json package-lock.json
```

#### 2. Upload to Sparkedhost

1. **Upload the files** via Sparkedhost file manager or SFTP:
   - `dist/` (compiled JavaScript)
   - `config/` (filters configuration)
   - `package.json`
   - `package-lock.json`

#### 3. Configure on Server

1. **Set environment variables** in Sparkedhost control panel
2. **Install dependencies:**
   ```bash
   npm install --production
   ```
3. **Start the application:**
   ```bash
   npm start
   ```

### Production Optimization

#### Using PM2 Process Manager

For better reliability and process management:

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Create PM2 ecosystem file** (`ecosystem.config.js`):
   ```javascript
   module.exports = {
     apps: [{
       name: 'discord-listener',
       script: 'dist/index.js',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production'
       }
     }]
   };
   ```

3. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Monitoring and Maintenance

#### Check Application Status

```bash
# View logs
pm2 logs discord-listener

# Check status
pm2 status

# Restart if needed
pm2 restart discord-listener
```

#### Troubleshooting Deployment Issues

1. **Check build logs** in Sparkedhost control panel
2. **Verify environment variables** are set correctly
3. **Ensure Node.js version** compatibility
4. **Check Discord bot permissions** and token validity
5. **Verify n8n webhook URL** is accessible

## 🔧 Troubleshooting

### Common Issues

**Bot doesn't respond to messages**
- Check that the bot has the necessary permissions in your Discord server
- Verify the bot token is correct
- Ensure the bot is online in Discord

**Webhook requests fail**
- Verify the n8n webhook URL is accessible
- Check that n8n is running and the webhook endpoint exists
- Review the bot logs for specific error messages

**Messages are being filtered out**
- Check your `config/filters.json` configuration
- Review the bot logs to see which filters are being applied
- Test with a simple filter configuration first

**Bot disconnects frequently**
- Check your internet connection
- Verify the Discord bot token is valid
- Review Discord API status

### Logs

The bot provides detailed logging for troubleshooting:

- `✅` Success messages
- `❌` Error messages  
- `⚠️` Warning messages
- `🚫` Filtered messages
- `📨` Message received
- `📤` Message forwarded

## 📁 Project Structure

```
/
├── src/
│   ├── index.ts              # Main entry point
│   ├── bot.ts                # Discord bot setup
│   ├── config.ts             # Configuration loader
│   ├── types.ts              # TypeScript interfaces
│   └── handlers/
│       ├── messageHandler.ts # Message event handler
│       └── filterHandler.ts  # Message filtering logic
├── config/
│   └── filters.json          # User-configurable filters
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the bot logs for error messages
3. Open an issue on GitHub with detailed information about your problem

---

**Happy automating! 🎉**
