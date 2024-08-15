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

// Функция для проверки существования кастомного поля
async function getOrCreateCustomField(fieldName, fieldType) {
  try {
    // Поиск поля по названию
    const fieldsResponse = await axios.get(`${apiUrl}/dealFields?api_token=${apiToken}`);
    const fields = fieldsResponse.data.data;

    // Проверка существования поля
    const existingField = fields.find(field => field.name === fieldName);

    if (existingField) {
      // Поле существует, возвращаем его ID
      return existingField.id;
    } else {
      // Поле не существует, создаем его
      const createFieldResponse = await axios.post(`${apiUrl}/dealFields?api_token=${apiToken}`, {
        name: fieldName,
        field_type: fieldType,
      });
      return createFieldResponse.data.data.id;
    }
  } catch (error) {
    console.error(`Error in getting or creating custom field ${fieldName}:`, error.response ? error.response.data : error.message);
    throw new Error(`Failed to get or create custom field: ${fieldName}`);
  }
}

// GET-маршрут для отображения формы в iframe
app.get('/callback', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'callback.html'));
});

// Обработка отправки формы
app.post('/submit-job', async (req, res) => {
  const jobData = req.body;  // Данные из формы

  try {
    // Создаем или находим кастомные поля
    const jobTypeFieldId = await getOrCreateCustomField('Job Type', 'varchar');
    const jobSourceFieldId = await getOrCreateCustomField('Job Source', 'varchar');
    const jobDescriptionFieldId = await getOrCreateCustomField('Job Description', 'text');
    const addressFieldId = await getOrCreateCustomField('Address', 'varchar');
    const cityFieldId = await getOrCreateCustomField('City', 'varchar');
    const stateFieldId = await getOrCreateCustomField('State', 'varchar');
    const zipCodeFieldId = await getOrCreateCustomField('Zip Code', 'varchar');
    const areaFieldId = await getOrCreateCustomField('Area', 'varchar');
    const startDateFieldId = await getOrCreateCustomField('Start Date', 'date');
    const startTimeFieldId = await getOrCreateCustomField('Start Time', 'time');
    const endTimeFieldId = await getOrCreateCustomField('End Time', 'time');
    const testSelectFieldId = await getOrCreateCustomField('Test Select', 'varchar');

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
      } else {
        // Если клиента не существует, создаем его
        const createPersonResponse = await axios.post(`${apiUrl}/persons?api_token=${apiToken}`, {
          name: `${jobData.firstName} ${jobData.lastName}`,
          email: jobData.email,
          phone: jobData.phone
        });

        personId = createPersonResponse.data.data.id;
      }
    }

    // Создаем новую сделку с кастомными полями
    const dealResponse = await axios.post(`${apiUrl}/deals?api_token=${apiToken}`, {
      title: `${jobData.firstName} ${jobData.lastName} - ${jobData.jobType}`,
      person_id: personId,
      value: 0, // Установите значение сделки, если это необходимо
      custom_fields: {
        [jobTypeFieldId]: jobData.jobType,
        [jobSourceFieldId]: jobData.jobSource,
        [jobDescriptionFieldId]: jobData.jobDescription,
        [addressFieldId]: jobData.address,
        [cityFieldId]: jobData.city,
        [stateFieldId]: jobData.state,
        [zipCodeFieldId]: jobData.zipCode,
        [areaFieldId]: jobData.area,
        [startDateFieldId]: jobData.startDate,
        [startTimeFieldId]: jobData.startTime,
        [endTimeFieldId]: jobData.endTime,
        [testSelectFieldId]: jobData.testSelect
      }
    });

    console.log('Deal Created:', dealResponse.data);
    res.send('Job created successfully!');
  } catch (error) {
    console.error('Error creating job:', error.response ? error.response.data : error.message);
    res.status(500).send('Error creating job');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
