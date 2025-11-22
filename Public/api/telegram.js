import TelegramBot from 'node-telegram-bot-api';

// TOKEN & OWNER ID SUDAH DISET LANGSUNG
const BOT_TOKEN = "8017357118:AAEHygULq2bJp7WL5gHormYcgBJdN5aJvLg";
const OWNER_ID = 6943312517;

const bot = new TelegramBot(BOT_TOKEN);

export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'No message provided' });
        }

        // Simple bot responses
        let reply = '';
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            reply = 'Hello! 👋 How can I assist you today?';
        } else if (lowerMessage.includes('help')) {
            reply = 'I can help you upload images to Telegram channel! Use the upload section to send images.';
        } else if (lowerMessage.includes('status')) {
            reply = '✅ Bot is online and functioning perfectly!';
        } else if (lowerMessage.includes('thank')) {
            reply = 'You\'re welcome! 😊';
        } else if (lowerMessage.includes('owner')) {
            reply = `Bot owner ID: ${OWNER_ID}`;
        } else if (lowerMessage.includes('channel')) {
            reply = `Channel ID: ${CHANNEL_ID}`;
        } else {
            reply = 'I understand. Feel free to upload images using the upload section above!';
        }

        // Optional: Send notification to owner
        try {
            await bot.sendMessage(OWNER_ID, `📩 Web Message: ${message}`);
        } catch (error) {
            console.log('Owner notification failed:', error.message);
        }

        res.status(200).json({ 
            success: true, 
            reply: reply 
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error: ' + error.message 
        });
    }
}
