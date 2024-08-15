const axios = require('axios');
const { apiToken, apiUrl } = require('./config');

let customFieldsCache = {};

async function getOrCreateCustomField(fieldName, fieldType) {
  if (customFieldsCache[fieldName]) {
    return customFieldsCache[fieldName];
  }

  try {
    const fieldsResponse = await axios.get(`${apiUrl}/dealFields?api_token=${apiToken}`);
    const fields = fieldsResponse.data.data;

    const existingField = fields.find(field => field.name === fieldName);

    if (existingField) {
      customFieldsCache[fieldName] = existingField.key;
      return existingField.key;
    } else {
      const createFieldResponse = await axios.post(`${apiUrl}/dealFields?api_token=${apiToken}`, {
        name: fieldName,
        field_type: fieldType,
      });
      customFieldsCache[fieldName] = createFieldResponse.data.data.key;
      return createFieldResponse.data.data.key;
    }
  } catch (error) {
    console.error(`Error in getting or creating custom field ${fieldName}:`, error.response ? error.response.data : error.message);
    throw new Error(`Failed to get or create custom field: ${fieldName}`);
  }
}

async function findOrCreatePerson(jobData) {
  let personId = null;

  if (jobData.email) {
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
      const createPersonResponse = await axios.post(`${apiUrl}/persons?api_token=${apiToken}`, {
        name: `${jobData.firstName} ${jobData.lastName}`,
        email: jobData.email,
        phone: jobData.phone
      });

      personId = createPersonResponse.data.data.id;
    }
  }

  return personId;
}

async function createJob(jobData) {
  try {
    const [
      personId,
      jobTypeFieldKey,
      jobSourceFieldKey,
      jobDescriptionFieldKey,
      addressFieldKey,
      cityFieldKey,
      stateFieldKey,
      zipCodeFieldKey,
      areaFieldKey,
      startDateFieldKey,
      startTimeFieldKey,
      endTimeFieldKey,
      testSelectFieldKey
    ] = await Promise.all([
      findOrCreatePerson(jobData),
      getOrCreateCustomField('Job Type', 'varchar'),
      getOrCreateCustomField('Job Source', 'varchar'),
      getOrCreateCustomField('Job Description', 'text'),
      getOrCreateCustomField('Address', 'varchar'),
      getOrCreateCustomField('City', 'varchar'),
      getOrCreateCustomField('State', 'varchar'),
      getOrCreateCustomField('Zip Code', 'varchar'),
      getOrCreateCustomField('Area', 'varchar'),
      getOrCreateCustomField('Start Date', 'date'),
      getOrCreateCustomField('Start Time', 'time'),
      getOrCreateCustomField('End Time', 'time'),
      getOrCreateCustomField('Test Select', 'varchar')
    ]);

    const dealResponse = await axios.post(`${apiUrl}/deals?api_token=${apiToken}`, {
      title: `${jobData.firstName} ${jobData.lastName} - ${jobData.jobType}`,
      person_id: personId,
      value: 0, // Установите значение сделки, если это необходимо
      [jobTypeFieldKey]: jobData.jobType,
      [jobSourceFieldKey]: jobData.jobSource,
      [jobDescriptionFieldKey]: jobData.jobDescription,
      [addressFieldKey]: jobData.address,
      [cityFieldKey]: jobData.city,
      [stateFieldKey]: jobData.state,
      [zipCodeFieldKey]: jobData.zipCode,
      [areaFieldKey]: jobData.area,
      [startDateFieldKey]: jobData.startDate,
      [startTimeFieldKey]: jobData.startTime,
      [endTimeFieldKey]: jobData.endTime,
      [testSelectFieldKey]: jobData.testSelect
    });

    console.log('Deal Created:', dealResponse.data);
  } catch (error) {
    console.error('Error creating job:', error.response ? error.response.data : error.message);
    throw new Error('Failed to create job');
  }
}

module.exports = {
  createJob
};
