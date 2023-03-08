/**
 * This module is the entry point for the backend server for the client.
 * NOT to be confused with the game server (which handles business logic for the game), this server is intended to deal with users' sessions.
 */
import express, { Express } from 'express';
// import session from 'express-session';
import ViteExpress from "vite-express";


const app: Express = express();
// Use session middleware: (WIP I have no idea how it works)
/* const sessionMiddleware = session({
    secret: 'coding cats',  // PLEASE CHANGE AND SET IN DOTENV IN PRODUCTION
    name: 'moogiwara.client',
    resave: false,
    saveUninitialized: false
});
app.use(sessionMiddleware); */
// ViteExpress.config({ mode: "production" })
ViteExpress.config({ vitePort: 8000 })

// app.get("/message", (_, res) => res.send("Hello from express!"));
// TODO: Insert express-session's handling here
// TODO: Change session store to connect-mongo once the session handling is proven to work

const BACKEND_PORT = 7000;
ViteExpress.listen(app, BACKEND_PORT, () => console.log(`CLient backend server is listening at port ${BACKEND_PORT}`));
