const express = require('express');
const path = require('path');
const middlewares = require('./middlewares');
const routes = require('./routes');

const app = express();
const port = process.env.PORT;

middlewares(app);

app.use(express.static(__dirname));

routes(app);

// runserver
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
