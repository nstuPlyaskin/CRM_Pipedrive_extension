const express = require('express');
const path = require('path');
const passport = require('passport');
const { Strategy } = require('passport-oauth2');
const bodyParser = require('body-parser');
const Pipedrive = require('pipedrive');

// Подключение SDK Pipedrive (загрузите его через npm)
const { Command, Event, PipedriveSDK } = require('pipedrive-sdk');

// Настройка API Token для Pipedrive
const apiToken = 'e843bc9cfa0c568a700dbf81a3c20014c006da4f'; // Замените на ваш API Token

// Создайте экземпляр клиента Pipedrive
const pipedrive = new Pipedrive.ApiClient(apiToken);

// Настройка SDK
const sdk = new PipedriveSDK();

const api = require('./api');
const config = require('./config');
const User = require('./db/user');

// Настройка Express
const app = express();
const port = 3000;

User.createTable();

passport.use(
    'pipedrive',
    new Strategy({
            authorizationURL: 'https://oauth.pipedrive.com/oauth/authorize',
            tokenURL: 'https://oauth.pipedrive.com/oauth/token',
            clientID: config.clientID || '',
            clientSecret: config.clientSecret || '',
            callbackURL: config.callbackURL || ''
        }, async (accessToken, refreshToken, profile, done) => {
            const userInfo = await api.getUser(accessToken);
            const user = await User.add(
                userInfo.data.name,
                accessToken,
                refreshToken
            );
            done(null, user);
        }
    )
);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(async (req, res, next) => {
    req.user = await User.getById(1);
    next();
});

// Middleware для обработки тела запроса
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// GET-маршрут для отображения формы в iframe
app.get('/callback', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Create a Job</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    padding: 0;
                }
                h1 {
                    color: #333;
                }
                form div {
                    margin-bottom: 15px;
                }
                label {
                    display: block;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                input, select {
                    width: 100%;
                    padding: 8px;
                    box-sizing: border-box;
                }
                button {
                    background-color: #4CAF50;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #45a049;
                }
            </style>
        </head>
        <body>
            <h1>Create a New Job</h1>
            <form action="/submit-job" method="post">
                <div>
                    <label>First Name:</label>
                    <input type="text" name="firstName" required>
                </div>
                <div>
                    <label>Last Name:</label>
                    <input type="text" name="lastName" required>
                </div>
                <div>
                    <label>Phone:</label>
                    <input type="tel" name="phone" required>
                </div>
                <div>
                    <label>Email (optional):</label>
                    <input type="email" name="email">
                </div>
                <div>
                    <label>Job Type:</label>
                    <select name="jobType">
                        <option value="type1">Type 1</option>
                        <option value="type2">Type 2</option>
                    </select>
                </div>
                <div>
                    <label>Start Date:</label>
                    <input type="date" name="startDate" required>
                </div>
                <div>
                    <label>Start Time:</label>
                    <input type="time" name="startTime" required>
                </div>
                <div>
                    <label>End Time:</label>
                    <input type="time" name="endTime">
                </div>
                <button type="submit">Create Job</button>
            </form>
        </body>
        </html>
    `);
});

// Обработка POST-запроса от Pipedrive
app.post('/callback', (req, res) => {
    const dealData = req.body;  // Пример: данные сделки от Pipedrive
    res.send('Received POST request');
});

// Обработка отправки формы
app.post('/submit-job', async (req, res) => {
    const jobData = req.body;  // Данные, введенные в форму

    try {
        // Пример создания новой сделки (или другого типа записи) в Pipedrive
        const deal = await pipedrive.Deals.add({
            title: `${jobData.firstName} ${jobData.lastName}`,
            person_id: {
                name: jobData.firstName,
                email: jobData.email,
                phone: jobData.phone
            },
            value: 0, // Установите значение сделки, если это необходимо
            custom_fields: {
                job_type: jobData.jobType,
                start_date: jobData.startDate,
                start_time: jobData.startTime,
                end_time: jobData.endTime
            }
        });

        console.log('Deal Created:', deal);

        // Покажем уведомление и закроем модальное окно
        await sdk.execute(Command.HIDE_FLOATING_WINDOW, {
            context: {
                message: 'Job created successfully!'
            }
        });

        res.send('Job created successfully!');
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).send('Error creating job');
    }
});

// Отслеживание событий видимости
sdk.listen(Event.VISIBILITY, ({ error, data }) => {
    if (error) {
        console.error('Visibility event error:', error);
    } else {
        console.log('Visibility event:', data);
        if (data.is_visible) {
            console.log('Floating window is visible');
        } else {
            console.log('Floating window is hidden');
        }
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

if (process.env.IS_LOCAL === 'true') {
    console.log(`🟢 App has started. \n🔗 Development URL: http://localhost:3000`);
} else {
    console.log(`🟢 App has started. \n🔗 Live URL: https://${process.env.PROJECT_DOMAIN}.glitch.me`);
}
