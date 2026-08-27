const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ডাটাবেজ কানেকশন
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('CyberMiner Database Connected!'))
    .catch(err => console.error('Database Error:', err));

// প্লেয়ার ডাটা মডেল
const PlayerSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    username: { type: String, default: 'Miner' },
    balance: { type: Number, default: 0 }
});
const Player = mongoose.model('Player', PlayerSchema);

// প্লেয়ার ডাটা লোড বা নতুন অ্যাকাউন্ট তৈরি
app.post('/api/player', async (req, res) => {
    const { telegramId, username } = req.body;
    try {
        let player = await Player.findOne({ telegramId });
        if (!player) {
            player = new Player({ telegramId, username });
            await player.save();
        }
        res.json(player);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// কয়েন ব্যালেন্স আপডেট (ট্যাপ সেভ করা)
app.post('/api/player/tap', async (req, res) => {
    const { telegramId, taps } = req.body;
    try {
        const player = await Player.findOneAndUpdate(
            { telegramId },
            { $inc: { balance: taps } },
            { new: true }
        );
        res.json({ success: true, balance: player.balance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
