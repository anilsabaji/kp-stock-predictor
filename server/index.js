const express = require('express');
const cors = require('cors');
const path = require('path');
const nseRoutes = require('./routes/nse');
const kpRoutes = require('./routes/kp');
const newsRoutes = require('./routes/news');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve static files from client build
app.use(express.static(path.join(__dirname, '../client/dist')));

// API routes
app.use('/api/nse', nseRoutes);
app.use('/api/kp', kpRoutes);
app.use('/api/news', newsRoutes);

// Serve documentation
app.use('/docs', express.static(path.join(__dirname, '../docs')));

// Fallback to client app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`KP Stock Predictor server running on port ${PORT}`);
});
