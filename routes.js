const path = require('path');
const { createJob } = require('./pipedriveService');

module.exports = (app) => {
  // GET-маршрут для отображения формы в iframe
  app.get('/callback', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'callback.html'));
  });

  // Обработка отправки формы
  app.post('/submit-job', async (req, res) => {
    try {
      await createJob(req.body);
      res.send('Job created successfully!');
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).send('Error creating job');
    }
  });
};
