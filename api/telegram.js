import TelegramBot from 'node-telegram-bot-api';

const BOT_TOKEN = process.env.BOT_TOKEN;
const OWNER_ID = parseInt(process.env.OWNER_ID);
const bot = new TelegramBot(BOT_TOKEN);

export default async function handler(req, res) {
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
        } else {
            reply = 'I understand. Feel free to upload images using the upload section above!';
        }

        // Optional: Send notification to owner
        try {
            await bot.sendMessage(OWNER_ID, `📩 Web Message: ${message}`);
        } catch (error) {
            console.log('Notification failed');
        }

        res.status(200).json({ 
            success: true, 
            reply: reply 
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}
