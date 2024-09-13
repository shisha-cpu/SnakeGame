const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors')
const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к базе данных MongoDB
mongoose.connect('mongodb+srv://admin:wwwwww@cluster0.weppimj.mongodb.net/snake?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('DB connected'))
    .catch(err => console.log('DB connection error', err));

// Middleware
app.use(bodyParser.json());
app.use(cors())
// Определение схемы и модели Mongoose
const scoreSchema = new mongoose.Schema({
    nickname: { type: String, required: true },
    score: { type: Number, required: true }
});

const Score = mongoose.model('Score', scoreSchema);

// Маршрут для добавления нового результата
app.post('/api/scores', async (req, res) => {
    try {
        const { nickname, score } = req.body;
        if (!nickname || !score) {
            return res.status(400).json({ message: 'Nickname and score are required.' });
        }

        // Поиск существующего результата пользователя
        const existingScore = await Score.findOne({ nickname });

        if (existingScore) {
            // Если результат выше существующего, обновляем
            if (score > existingScore.score) {
                existingScore.score = score;
                await existingScore.save();
            }
        } else {
            // Если результата нет, создаем новый
            const newScore = new Score({ nickname, score });
            await newScore.save();
        }

        res.status(200).json({ nickname, score });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Маршрут для получения всех результатов
app.get('/api/scores', async (req, res) => {
    try {
        const scores = await Score.find().sort({ score: -1 }).limit(10); // Показать топ 10 результатов
        res.json(scores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
