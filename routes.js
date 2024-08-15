const path = require('path');
const { createJob } = require('./pipedriveService');

module.exports = (app) => {
  // showing iform (ui)
  app.get('/callback', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'callback.html'));
  });

  // projecss data from form
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
