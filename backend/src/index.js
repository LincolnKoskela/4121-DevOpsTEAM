const express = require('express');
const helmet  = require('helmet');
const app     = express();

app.use(helmet());		// Sets sercure HTTP headers
app.use(express.json({
  limit: '1mb',
  verify: (req, res, buf) => {
    req.rawBody = Buffer.from(buf);
  }
}));

app.use('/incidents', require('./routes/incidents'));
app.use('/webhooks',  require('./routes/webhooks'));

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'incidentcmd-api' });
});

app.get('/incidents', (req, res) => {
  res.json([]);
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

app.listen(PORT, HOST, () => {
  console.log(`API listening on ${HOST}:${PORT}`);
});
