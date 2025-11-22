import TelegramBot from 'node-telegram-bot-api';
import formidable from 'formidable-serverless';

// TOKEN & CHANNEL ID SUDAH DISET LANGSUNG
const BOT_TOKEN = "8017357118:AAEHygULq2bJp7WL5gHormYcgBJdN5aJvLg";
const CHANNEL_ID = "-1002791023344";

const bot = new TelegramBot(BOT_TOKEN);
let counter = 0;

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

export const config = { 
    api: { 
        bodyParser: false 
    } 
};

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
        const form = new formidable.IncomingForm();
        
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Form parsing error:', err);
                return res.status(500).json({ success: false, message: 'Error parsing form data' });
            }

            if (!files.photo) {
                return res.status(400).json({ success: false, message: 'No photo uploaded' });
            }

            try {
                // Update counter
                counter += 1;
                
                // Generate Malaysia date
                const currentDate = getCurrentMalaysiaDate();
                const caption = `━━━━━━━━━━━━━━━━━━\nTHANKS FOR ORDER\n━━━━━━━━━━━━━━━━━━\n📅 TARIKH: ${currentDate}\n# ${counter}\n━━━━━━━━━━━━━━━━━━`;

                console.log('Sending photo to channel:', CHANNEL_ID);
                
                // Send to Telegram channel
                await bot.sendPhoto(CHANNEL_ID, files.photo.path, { 
                    caption: caption 
                });

                res.status(200).json({ 
                    success: true, 
                    message: 'Gambar berjaya dihantar ke channel! ✔️',
                    counter: counter
                });

            } catch (telegramError) {
                console.error('Telegram API error:', telegramError);
                res.status(500).json({ 
                    success: false, 
                    message: 'Error sending to Telegram: ' + telegramError.message 
                });
            }
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error: ' + error.message 
        });
    }
      }
