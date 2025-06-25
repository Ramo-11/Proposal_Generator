const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');
const puppeteer = require('puppeteer');
const path = require('path');
const PDFService = require('./PDFService');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const db = new sqlite3.Database('./proposals.db');

// Create proposals table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS proposals (
    id TEXT PRIMARY KEY,
    business_name TEXT NOT NULL,
    contact_person TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    project_type TEXT,
    timeline TEXT,
    budget REAL,
    features TEXT,
    additional_notes TEXT,
    status TEXT DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'sahab-solutions-secret',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.set('views', './views');

// Routes
app.get('/', (req, res) => {
  db.all('SELECT * FROM proposals ORDER BY created_at DESC', (err, proposals) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
    res.render('dashboard', { proposals, dayjs });
  });
});

app.post('/proposal', (req, res) => {
  const id = uuidv4();
  const {
    business_name,
    contact_person,
    contact_email,
    contact_phone,
    project_type,
    timeline,
    budget,
    features,
    additional_notes
  } = req.body;

  const stmt = db.prepare(`INSERT INTO proposals 
    (id, business_name, contact_person, contact_email, contact_phone, 
     project_type, timeline, budget, features, additional_notes) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  stmt.run([id, business_name, contact_person, contact_email, contact_phone,
           project_type, timeline, budget, features, additional_notes], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create proposal' });
    }
    res.json({ success: true, id });
  });
});

app.put('/proposal/:id', (req, res) => {
  const { id } = req.params;
  const {
    business_name,
    contact_person,
    contact_email,
    contact_phone,
    project_type,
    timeline,
    budget,
    features,
    additional_notes
  } = req.body;

  const stmt = db.prepare(`UPDATE proposals SET 
    business_name = ?, contact_person = ?, contact_email = ?, contact_phone = ?,
    project_type = ?, timeline = ?, budget = ?, features = ?, additional_notes = ?,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`);

  stmt.run([business_name, contact_person, contact_email, contact_phone,
           project_type, timeline, budget, features, additional_notes, id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update proposal' });
    }
    res.json({ success: true });
  });
});

app.delete('/proposal/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM proposals WHERE id = ?', [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete proposal' });
    }
    res.json({ success: true });
  });
});

app.get('/proposal/:id/pdf', async (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM proposals WHERE id = ?', [id], async (err, proposal) => {
    if (err || !proposal) {
      console.error('Proposal not found:', err);
      return res.status(404).send('Proposal not found');
    }

    try {
      const pdf = await PDFService.generateProposalPDF(proposal);
      const filename = PDFService.generateFilename(proposal.business_name);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdf.length);
      
      res.end(pdf);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      res.status(500).json({ error: 'Error generating PDF: ' + error.message });
    }
  });
});

app.get('/proposal/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM proposals WHERE id = ?', [id], (err, proposal) => {
    if (err || !proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.json(proposal);
  });
});

app.get('/proposal/:id/html', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM proposals WHERE id = ?', [id], (err, proposal) => {
    if (err || !proposal) {
      return res.status(404).send('Proposal not found');
    }
    res.render('proposal-view', { proposal, dayjs });
  });
});

app.listen(PORT, () => {
  console.log(`Sahab Solutions Proposal Builder running on port ${PORT}`);
});