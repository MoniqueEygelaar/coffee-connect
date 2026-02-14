const express = require('express');
const cors = require('cors');
const allUsers = require('./allUsers');

const app = express();
app.use(cors());
app.use(express.json());

let users = [...allUsers];
let availability = [];
let matches = [];

app.get('/', (req, res) => res.send('Server is running!'));

app.get('/users', (req, res) => {
  res.json(users);
});

app.post('/login', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) return res.status(403).json({ error: 'Not authorized' });

  res.json(user);
});

app.get('/availability/:userId', (req, res) => {
  const userAvailability = availability.find(a => a.userId === req.params.userId);
  res.json(userAvailability || { userId: req.params.userId, slots: [] });
});

app.post('/availability', (req, res) => {
  const { userId, slots } = req.body;
  if (!userId || !Array.isArray(slots)) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  const index = availability.findIndex(a => a.userId === userId);

  if (index >= 0) {
    availability[index].slots = slots;
  } else {
    availability.push({ userId, slots });
  }

  res.json({ userId, slots });
});

app.get("/matches", (req, res) => {
  res.json(matches);
});

app.listen(4000, () => console.log('Server running on port 4000'));
