const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();

app.use(express.json());

const dbPath = "./database.db";

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    console.log("Database connected successfully");
  } catch (error) {
    console.log(`Database Error: ${error.message}`);
    process.exit(1);
  }
};

app.get("/books/", async (request, response) => {
  const books = await db.all("SELECT * FROM book");
  response.send(books);
});

app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;

  const book = await db.get(
    "SELECT * FROM book WHERE id = ?",
    [bookId]
  );

  if (book === undefined) {
    response.status(404).send("Book not found");
  } else {
    response.send(book);
  }
});

app.post("/books/", async (request, response) => {
  const { title, author, price, pages } = request.body;

  const query = `
    INSERT INTO book (title, author, price, pages)
    VALUES (?, ?, ?, ?)
  `;

  await db.run(query, [title, author, price, pages]);

  response.status(201).send("Book added successfully");
});

app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const { title, author, price, pages } = request.body;

  const query = `
    UPDATE book
    SET title = ?, author = ?, price = ?, pages = ?
    WHERE id = ?
  `;

  const result = await db.run(query, [
    title,
    author,
    price,
    pages,
    bookId,
  ]);

  if (result.changes === 0) {
    response.status(404).send("Book not found");
  } else {
    response.send("Book updated successfully");
  }
});

app.delete("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;

  const result = await db.run(
    "DELETE FROM book WHERE id = ?",
    [bookId]
  );

  if (result.changes === 0) {
    response.status(404).send("Book not found");
  } else {
    response.send("Book deleted successfully");
  }
});

const PORT = 3000;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
};

initializeDBAndServer().then(() => {
  startServer();
});

