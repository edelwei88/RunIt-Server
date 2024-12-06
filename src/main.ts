import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors"
import { SQLiteController } from "./db";
import { Compiler } from "./compile";

dotenv.config();
const port = process.env.PORT || 3000;

const app: Express = express();
app.use(cors());
app.use(express.json());
app.use(express.text());

const dbc: SQLiteController = new SQLiteController();
dbc.init();
Compiler.init();

app.post("/login", (req, res) => {
  const login = req.body.login;
  const password = req.body.password;

  if (dbc.find_user(login, password)) {
    const usertoken = dbc.add_token(dbc.get_user_id(login, password));
    res.send({ token: usertoken });
  }
  else
    res.sendStatus(403);
});

app.post("/register", (req, res) => {
  const login = req.body.login;
  const email = req.body.email;
  const password = req.body.password;

  if (dbc.add_user(login, email, password) == 0)
    res.sendStatus(200);
  else
    res.sendStatus(403);
});

app.post("/refreshtoken", (req, res) => {
  const token = req.body.token;

  if (dbc.update_token_expiredate(token))
    res.sendStatus(200);
  else
    res.sendStatus(404);
})

app.post("/checktoken", (req, res) => {
  const token = req.body.token;

  if (dbc.check_token(token))
    res.sendStatus(200);
  else
    res.sendStatus(403);
})

app.post("/api/compile", (req, res) => {
  const source = req.body;

  res.setHeader('Content-Type', 'text/plain');
  res.send(Compiler.compile(source));
})

app.post('/getuserbytoken', (req, res) => {
  const token = req.body.token;

  if (token)
    res.send(dbc.get_user_by_token(token));
})

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
});
