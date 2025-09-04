import express from "express";
import sqlite3 from "sqlite3";
import bodyParser from "body-parser";
import session from "express-session";

const app = express();
const db = new sqlite3.Database("botdb.sqlite");

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: "tanjiro-secret-key",
  resave: false,
  saveUninitialized: true
}));
app.use(express.static("public"));

// Password admin
const ADMIN_PASSWORD = "DB-TANJIRO";

// Middleware cek login
function cekLogin(req, res, next) {
  if (req.session.loggedIn) return next();
  res.redirect("/login.html");
}

// Route login
app.post("/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    req.session.loggedIn = true;
    res.redirect("/");
  } else {
    res.send("<h1>Password salah! <a href='/login.html'>Coba lagi</a></h1>");
  }
});

// Lindungi semua route
app.use((req, res, next) => {
  if (req.path === "/login" || req.path.startsWith("/login.html")) return next();
  cekLogin(req, res, next);
});

// Buat tabel
db.run("CREATE TABLE IF NOT EXISTS numbers (id INTEGER PRIMARY KEY, phone TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
db.run("CREATE TABLE IF NOT EXISTS tokens (id INTEGER PRIMARY KEY, token TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");

// Tambah nomor
app.post("/add-number", (req, res) => {
  const { phone } = req.body;
  db.run("INSERT INTO numbers (phone) VALUES (?)", [phone], (err) => {
    if (err) return res.send("Error: " + err.message);
    res.redirect("/list-numbers.html");
  });
});

// Ambil daftar nomor
app.get("/numbers", (req, res) => {
  db.all("SELECT * FROM numbers", [], (err, rows) => {
    if (err) return res.json({ error: err.message });
    res.json(rows);
  });
});

// Hapus nomor
app.get("/delete-number/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM numbers WHERE id = ?", [id], (err) => {
    if (err) return res.send("Error: " + err.message);
    res.redirect("/list-numbers.html");
  });
});

// Tambah token
app.post("/add-token", (req, res) => {
  const { token } = req.body;
  db.run("INSERT INTO tokens (token) VALUES (?)", [token], (err) => {
    if (err) return res.send("Error: " + err.message);
    res.redirect("/list-tokens.html");
  });
});

// Ambil daftar token
app.get("/tokens", (req, res) => {
  db.all("SELECT * FROM tokens", [], (err, rows) => {
    if (err) return res.json({ error: err.message });
    res.json(rows);
  });
});

// Hapus token
app.get("/delete-token/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM tokens WHERE id = ?", [id], (err) => {
    if (err) return res.send("Error: " + err.message);
    res.redirect("/list-tokens.html");
  });
});

app.listen(3000, () => console.log("✅ Server jalan di http://localhost:3000"));