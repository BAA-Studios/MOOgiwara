/**
 * This module is the entry point for the backend server for the client.
 * NOT to be confused with the game server (which handles business logic for the game), this server is for serving the game client to users.
 */
import express, { Express } from 'express';
// import session from 'express-session';
import ViteExpress from "vite-express";


const app: Express = express();
// ViteExpress.config({ mode: "production" })
ViteExpress.config({ vitePort: 8000 })

// app.get("/message", (_, res) => res.send("Hello from express!"));
// TODO: Insert express-session's handling here
// TODO: Change session store to connect-mongo once the session handling is proven to work

const BACKEND_PORT = 7000;
ViteExpress.listen(app, BACKEND_PORT, () => console.log(`CLient backend server is listening at port ${BACKEND_PORT}`));
