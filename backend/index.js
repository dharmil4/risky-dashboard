const express = require('express');
const cors = require('cors');
const app = express();
const cxoRoutes = require('./routes/cxo');
const firewallRoutes = require('./routes/firewall')
const executvieRoutes = require('./routes/executive')
const demo = require('./routes/demo')

app.use(cors());
app.use('/api', cxoRoutes);
app.use('/api', executvieRoutes);
app.use('/api', firewallRoutes);
app.use('/api', demo);

const port = 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
