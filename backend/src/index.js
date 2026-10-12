const express = require('express');
const helmet  = require('helmet');
const app     = express();

app.use(helmet());		// Sets sercure HTTP headers
app.use(express.json({ limit: 'lmb' }));

app.use('/incidents', require('./routes/incidents'));
app.use('/webhooks',  require('./routes/webhooks'));

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'incidentcmd-api' });
});

app.get('/incidents', (req, res) => {
  res.json([]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));
