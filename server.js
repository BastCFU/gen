const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');
const cors = require('cors');

const app = express();
const port = 5000;
const connectionString = `postgres://admin:admin@${process.env.DB_HOST}:5432/my-app`;

app.use(bodyParser.json());
app.use(cors());

const pool = new pg.Pool({
  connectionString,
});

app.get('/api/health', (req, res) => {
    res.status(200).json({api:"up"})
  });

function createArticlesTable() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS articles (
            id serial PRIMARY KEY,
            title VARCHAR (255) NOT NULL,
            content TEXT
        );
    `;

    pool.query(createTableQuery, (err, result) => {
        if (err) {
        console.error('Erreur lors de la création de la table :', err);
        } else {
        console.log('Table "articles" créée avec succès.');
        }
    });
}
  

// Récupérer tous les articles
app.get('/api/articles', (req, res) => {
  pool.query('SELECT * FROM articles', (err, result) => {
    if (err) {
      res.status(500).json(err);
      return;
    }
    res.json(result.rows);
  });
});

// Ajouter un nouvel article
app.post('/api/articles', (req, res) => {
  const { title, content } = req.body;
  pool.query('INSERT INTO articles (title, content) VALUES ($1, $2)', [title, content], (err, result) => {
    if (err) {
      res.status(500).json(err);
      return;
    }
    res.status(201).json(result.rows);
  });
});

// Mettre à jour un article
app.put('/api/articles/:id', (req, res) => {
  const { title, content } = req.body;
  const id = req.params.id;
  pool.query('UPDATE articles SET title = $1, content = $2 WHERE id = $3', [title, content, id], (err, result) => {
    if (err) {
      res.status(500).json(err);
      return;
    }
    res.json(result.rows);
  });
});

// Supprimer un article
app.delete('/api/articles/:id', (req, res) => {
  const id = req.params.id;
  pool.query('DELETE FROM articles WHERE id = $1', [id], (err, result) => {
    if (err) {
      res.status(500).json(err);
      return;
    }
    res.json(result.rows);
  });
});

createArticlesTable()

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
