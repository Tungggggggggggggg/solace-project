require('dotenv').config();
const express = require('express');
const cors = require('cors');
const postRoutes = require('./routes/posts');
const authRouter = require('./routes/auth');
const searchRoutes = require('./routes/search');
const reportRoutes = require('./routes/reports');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Solace API');
});

app.use('/api/posts', postRoutes);
app.use('/api/auth', authRouter);
app.use('/api', searchRoutes);
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server chạy trên cổng ${PORT}`));