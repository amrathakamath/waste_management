const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());

let complaintQueue = [];
let resolvedComplaintsStack = [];

// POST endpoint to add a new complaint
app.post('/complaints', (req, res) => {
  const { complaint, urgency } = req.body;
  if (!complaint || typeof urgency !== 'number') {
    return res.status(400).json({ message: 'Invalid complaint or urgency' });
  }
  complaintQueue.push({ complaint, urgency });
  res.status(201).json({ message: 'Complaint added successfully' });
});

// GET endpoint to retrieve all complaints
app.get('/complaints', (req, res) => {
  res.json(complaintQueue);
});

// POST endpoint to resolve the highest priority complaint
app.post('/resolve-complaint', (req, res) => {
  if (complaintQueue.length === 0) {
    return res.status(404).json({ message: 'No complaints to resolve' });
  }
  // Sort queue based on urgency (higher urgency goes first)
  complaintQueue.sort((a, b) => b.urgency - a.urgency);
  const resolvedComplaint = complaintQueue.shift();
  resolvedComplaintsStack.push(resolvedComplaint);

  // Log resolved complaint in a CSV file
  const logEntry = `${new Date().toISOString()},${resolvedComplaint.complaint},${resolvedComplaint.urgency}\n`;
  fs.appendFileSync('resolved_complaints.csv', logEntry);

  res.json({ message: 'Complaint resolved', resolvedComplaint });
});

// GET endpoint to retrieve resolved complaints
app.get('/resolved-complaints', (req, res) => {
  res.json(resolvedComplaintsStack);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
