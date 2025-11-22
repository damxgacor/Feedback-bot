const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

// Bot configuration
const BOT_TOKEN = "8017357118:AAEHygULq2bJp7WL5gHormYcgBJdN5aJvLg";
const CHANNEL_ID = "-1002791023344";
const OWNER_ID = 6943312517;

// Initialize bot and express app
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const app = express();

// Counter file path
const COUNTER_FILE = path.join(__dirname, 'counter.json');

// Function to get current Malaysia date
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

// Function to read counter from file
async function readCounter() {
    try {
        const data = await fs.readFile(COUNTER_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, create with initial value
        if (error.code === 'ENOENT') {
            const initialCounter = { counter: 0 };
            await fs.writeFile(COUNTER_FILE, JSON.stringify(initialCounter, null, 2));
            return initialCounter;
        }
        throw error;
    }
}

// Function to write counter to file
async function writeCounter(counterData) {
    await fs.writeFile(COUNTER_FILE, JSON.stringify(counterData, null, 2));
}

// Function to get the highest resolution photo
function getHighestResolutionPhoto(photos) {
    let highestRes = null;
    let maxSize = 0;
    
    photos.forEach(photo => {
        const size = photo.width * photo.height;
        if (size > maxSize) {
            maxSize = size;
            highestRes = photo;
        }
    });
    
    return highestRes;
}

// Handle photo messages
bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Check if user is owner
    if (userId !== OWNER_ID) {
        await bot.sendMessage(chatId, "Maaf, hanya owner boleh gunakan bot ini.");
        return;
    }

    try {
        // Get highest resolution photo
        const highestResPhoto = getHighestResolutionPhoto(msg.photo);
        const fileId = highestResPhoto.file_id;

        // Read and update counter
        const counterData = await readCounter();
        counterData.counter += 1;
        await writeCounter(counterData);

        // Generate caption
        const currentDate = getCurrentMalaysiaDate();
        const caption = `━━━━━━━━━━━━━━━━━━\nTHANKS FOR ORDER\n━━━━━━━━━━━━━━━━━━\n📅 TARIKH: ${currentDate}\n# ${counterData.counter}\n━━━━━━━━━━━━━━━━━━`;

        // Forward photo to channel with caption
        await bot.sendPhoto(CHANNEL_ID, fileId, { caption: caption });

        // Send confirmation to owner
        await bot.sendMessage(chatId, "Gambar berjaya dihantar ke channel! ✔️");

    } catch (error) {
        console.error('Error processing photo:', error);
        await bot.sendMessage(chatId, "Terjadi error ketika memproses gambar. ❌");
    }
});

// Handle text messages for unauthorized users
bot.on('text', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Check if user is owner
    if (userId !== OWNER_ID) {
        await bot.sendMessage(chatId, "Maaf, hanya owner boleh gunakan bot ini.");
    }
});

// Express server for uptime monitoring
app.get('/', (req, res) => {
    res.send('Bot is Running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});

// Handle bot errors
bot.on('error', (error) => {
    console.error('Bot error:', error);
});

console.log('Telegram bot started...');
