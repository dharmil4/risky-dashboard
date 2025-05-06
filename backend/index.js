const express = require('express');
const cors = require('cors');
const app = express();
const cxoRoutes = require('./routes/cxo');
const firewallRoutes = require('./routes/firewall')
const executvieRoutes = require('./routes/executive')

app.use(cors());
app.use('/api', cxoRoutes);
app.use('/api', executvieRoutes);
app.use('/api', firewallRoutes);

const port = 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
