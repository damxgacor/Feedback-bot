import TelegramBot from 'node-telegram-bot-api';
import formidable from 'formidable-serverless';

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const bot = new TelegramBot(BOT_TOKEN);
let counter = 0; // In production, use database

function getCurrentMalaysiaDate() {
    const options = {
        timeZone: 'Asia/Kuala_Lumpur',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    const formatter = new Intl.DateTimeFormat('en-MY', options);
    const parts = formatter.formatToParts(new Date());
    
    const day = parts.find(part => part.type === 'day').value;
    const month = parts.find(part => part.type === 'month').value;
    const year = parts.find(part => part.type === 'year').value;
    
    return `${day}/${month}/${year}`;
}

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const form = new formidable.IncomingForm();
        
        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error parsing form' });
            }

            if (!files.photo) {
                return res.status(400).json({ success: false, message: 'No photo uploaded' });
            }

            try {
                counter += 1;
                const currentDate = getCurrentMalaysiaDate();
                const caption = `━━━━━━━━━━━━━━━━━━\nTHANKS FOR ORDER\n━━━━━━━━━━━━━━━━━━\n📅 TARIKH: ${currentDate}\n# ${counter}\n━━━━━━━━━━━━━━━━━━`;

                await bot.sendPhoto(CHANNEL_ID, files.photo.path, { caption: caption });

                res.status(200).json({ 
                    success: true, 
                    message: 'Image successfully sent to channel!',
                    counter: counter
                });

            } catch (error) {
                console.error('Telegram error:', error);
                res.status(500).json({ success: false, message: 'Error sending to Telegram' });
            }
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}
