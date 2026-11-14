
const express = require('express');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3010;

// Serve CSS and JavaScript
app.use(express.static(path.join(__dirname, 'static')));

// Serve dashboard HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'online' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dashboard running on port ${PORT}`);
});
