import express, { Router } from "express";
import expressWs from 'express-ws';
import ViteExpress from "vite-express";

import { RouterWebsocket } from "./ws.js";
import { RouterCaptcha } from "./captcha.js";

import dotenv from 'dotenv';
dotenv.config();

const app = express();
expressWs(app);

app.get("/hello", (req, res) => {
  res.send("Hello Vite!");
});

app.use('/ws', RouterWebsocket);
app.use('/captcha', RouterCaptcha);

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);
