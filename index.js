const express = require('express');
const path = require('path');
const middlewares = require('./middlewares');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

// Настройка Middleware
middlewares(app);

// Раздача статических файлов
app.use(express.static(__dirname));

// Маршруты
routes(app);

// Запуск сервера
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
