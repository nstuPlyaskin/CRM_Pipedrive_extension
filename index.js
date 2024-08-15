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

// Обработка отправки формы
app.post('/submit-job', async (req, res) => {
  const jobData = req.body;  // Данные из формы

  try {
    // Создаем нового клиента (или настраиваем существующего)
    let personId = null;
    if (jobData.email) {
      // Поиск клиента по email
      const searchResponse = await axios.get(`${apiUrl}/persons/search`, {
        params: {
          term: jobData.email,
          fields: 'email',
          api_token: apiToken
        }
      });
      if (searchResponse.data.data && searchResponse.data.data.items.length > 0) {
        personId = searchResponse.data.data.items[0].item.id;
      }
    }

    // Создаем новую сделку
    const dealResponse = await axios.post(`${apiUrl}/deals?api_token=${apiToken}`, {
      title: `${jobData.firstName} ${jobData.lastName}`,
      person_id: personId,
      value: 0, // Установите значение сделки, если это необходимо
      custom_fields: {
        job_type: jobData.jobType,
        job_source: jobData.jobSource,
        job_description: jobData.jobDescription,
        address: jobData.address,
        city: jobData.city,
        state: jobData.state,
        zip_code: jobData.zipCode,
        area: jobData.area,
        start_date: jobData.startDate,
        start_time: jobData.startTime,
        end_time: jobData.endTime,
        test_select: jobData.testSelect
      }
    });

    console.log('Deal Created:', dealResponse.data);
    res.send('Job created successfully!');
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).send('Error creating job');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
