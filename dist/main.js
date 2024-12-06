"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const compile_1 = require("./compile");
dotenv_1.default.config();
const port = process.env.PORT || 3000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.text());
const dbc = new db_1.SQLiteController();
dbc.init();
compile_1.Compiler.init();
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
});
app.post("/checktoken", (req, res) => {
    const token = req.body.token;
    if (dbc.check_token(token))
        res.sendStatus(200);
    else
        res.sendStatus(403);
});
app.post("/api/compile", (req, res) => {
    const source = req.body;
    res.send(compile_1.Compiler.compile(source));
});
app.post('/getuserbytoken', (req, res) => {
    const token = req.body.token;
    if (token)
        res.send(dbc.get_user_by_token(token));
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
