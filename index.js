const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Pipedrive = require('pipedrive');

// Настройка API Token для Pipedrive
const apiToken = 'e843bc9cfa0c568a700dbf81a3c20014c006da4f'; // Замените на ваш API Token

// Создайте экземпляр клиента Pipedrive
const pipedrive = new Pipedrive.ApiClient(apiToken);

// Настройка Express
const app = express();
const port = 3000;

// Настройка EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Раздача статических файлов
app.use(express.static(__dirname));

// Middleware для обработки тела запроса
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// GET-маршрут для отображения формы в iframe
app.get('/callback', (req, res) => {
    res.render('callback');
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
        res.send('Job created successfully!');
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).send('Error creating job');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
