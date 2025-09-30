const express = require('express');
// Імпортуємо наші дані
const { users, documents, employees } = require('./data');
const app = express();
const PORT = 3000;

const authMiddleware = (req, res, next) => {
  // Отримуємо дані для входу з заголовків запиту
  const login = req.headers['x-login'];
  const password = req.headers['x-password'];
  // Шукаємо користувача у нашій "базі даних"

  const user = users.find(u => u.login === login && u.password === password);

  // Якщо користувача не знайдено, або дані невірні
  if (!user) {
    // Відповідаємо статусом 401 Unauthorized і припиняємо обробку
    return res.status(401).json({ message: 'Authentication failed. Please provide valid credentials in headers X-Login and X-Password.' });
  }

  // Якщо користувач знайдений, додаємо його дані до об'єкта запиту
  // Це дозволить наступним обробникам знати, хто надіслав запит

  req.user = user;

  // Передаємо управління наступному middleware або основному обробнику маршруту
  next();
};

const adminOnlyMiddleware = (req, res, next) => {

  // Перевіряємо, чи існує об'єкт user і яка в нього роль
  // req.user був доданий на попередньому етапі в authMiddleware

  if (!req.user || req.user.role !== 'admin') {
    // Якщо роль не 'admin', відповідаємо статусом 403 Forbidden
    return res.status(403).json({ message: 'Access denied. Admin role required.' });

  }

  // Якщо перевірка пройдена, передаємо управління далі
  next();
};

const loggingMiddleware = (req, res, next) => {
  // Отримуємо поточний час, HTTP метод та URL запиту
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;

  // Виводимо інформацію в консоль
  console.log(`[${timestamp}] ${method} ${url}`);

  // ВАЖЛИВО: передаємо управління наступному middleware
  // Якщо не викликати next(), обробка запиту "зависне" на цьому місці

  next();
};

app.use(express.json());

// Глобально застосовуємо middleware для логування
// Цей рядок має бути ПЕРЕД усіма маршрутами

app.use(loggingMiddleware);

// --- МАРШРУТИ ДЛЯ РЕСУРСІВ --

// Маршрут для отримання списку всіх документів
app.get('/documents', authMiddleware, (req, res) => {
  res.status(200).json(documents);
});

app.post('/documents', authMiddleware, (req, res) => {
  const { title, content } = req.body;

  // Перевірка, чи передані всі необхідні поля

  if (!title || !content) {
    return res.status(400).json({ message: 'Bad Request. Fields "title" and "content" are required.' });
  }

  const newDocument = {
    id: Date.now(),
    title,
    content,
  };

  documents.push(newDocument);
  res.status(201).json(newDocument);
});

app.delete('/documents/:id', authMiddleware, (req, res) => {
    // Отримуємо id з параметрів маршруту
    const documentId = parseInt(req.params.id);
    const documentIndex = documents.findIndex(doc => doc.id === documentId);

    // Якщо документ з таким id не знайдено
    if (documentIndex === -1) {
        return res.status(404).json({ message: 'Document not found' });
    }

    // Видаляємо документ з масиву
    documents.splice(documentIndex, 1);

    // Відповідаємо статусом 204 No Content, тіло відповіді буде порожнім
    res.status(204).send();
});


// Маршрут для отримання списку всіх співробітників
app.get('/employees', authMiddleware, adminOnlyMiddleware, (req, res) => {
  res.status(200).json(employees);
});

// --- КІНЕЦЬ МАРШРУТІВ ---

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
