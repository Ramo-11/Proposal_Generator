import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../server/proposals.db');

const initDB = async () => {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS proposals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      businessName TEXT NOT NULL,
      date TEXT NOT NULL,
      timeline TEXT NOT NULL,
      features TEXT NOT NULL,
      cost TEXT NOT NULL,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
};

export const createProposal = async (data) => {
  const db = await initDB();
  const { businessName, date, timeline, features, cost, notes } = data;

  await db.run(
    `INSERT INTO proposals (businessName, date, timeline, features, cost, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [businessName, date, timeline, features, cost, notes]
  );
};

export const getAllProposals = async () => {
  const db = await initDB();
  return db.all(`SELECT * FROM proposals ORDER BY createdAt DESC`);
};

export const getProposalById = async (id) => {
  const db = await initDB();
  return db.get(`SELECT * FROM proposals WHERE id = ?`, [id]);
};

export const deleteProposal = async (id) => {
  const db = await initDB();
  await db.run(`DELETE FROM proposals WHERE id = ?`, [id]);
};

export const updateProposal = async (id, data) => {
  const db = await initDB();
  const { businessName, date, timeline, features, cost, notes } = data;

  await db.run(
    `UPDATE proposals
     SET businessName = ?, date = ?, timeline = ?, features = ?, cost = ?, notes = ?
     WHERE id = ?`,
    [businessName, date, timeline, features, cost, notes, id]
  );
};
