const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

// Настройка API Token для Pipedrive
const apiToken = 'e843bc9cfa0c568a700dbf81a3c20014c006da4f';
const apiUrl = 'https://api.pipedrive.com/v1';

// Настройка Express
const app = express();
const port = 3000;

// Раздача статических файлов
app.use(express.static(__dirname));

// Middleware для обработки тела запроса
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// GET-маршрут для отображения формы в iframe
app.get('/callback', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'callback.html'));
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
    // Создаем новую сделку в Pipedrive
    const response = await axios.post(`${apiUrl}/deals?api_token=${apiToken}`, {
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

    console.log('Deal Created:', response.data);
    res.send('Job created successfully!');
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).send('Error creating job');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
