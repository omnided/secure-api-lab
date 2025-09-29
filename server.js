const express = require('express');
// Імпортуємо наші дані
const { documents, employees } = require('./data');
const app = express();
const PORT = 3000;

// Middleware для автоматичного парсингу JSON-тіла запиту
// Це необхідно для роботи POST-запитів
app.use(express.json());

// --- МАРШРУТИ ДЛЯ РЕСУРСІВ --

// Маршрут для отримання списку всіх документів
app.get('/documents', (req, res) => {
  res.status(200).json(documents);
});

// Маршрут для створення нового документа
app.post('/documents', (req, res) => {

  const newDocument = req.body;

  // Імітуємо створення ID
  newDocument.id = Date.now();
  documents.push(newDocument);
  // Відповідаємо статусом 201 Created та повертаємо створений об'єкт
  res.status(201).json(newDocument);
});

// Маршрут для отримання списку всіх співробітників
app.get('/employees', (req, res) => {
  res.status(200).json(employees);
});

// --- КІНЕЦЬ МАРШРУТІВ ---

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
