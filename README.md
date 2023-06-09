# MOOgiwara

[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts)
![MVP](https://progress-bar.dev/30/?title=Minimum%20Viable%20Product)

MOOgiwara is a multiplayer online browser ONE PIECE TCG game simulator, written in TypeScript, that relies on [`Phaser`](https://github.com/photonstorm/phaser) and [`Node.js`](https://nodejs.org/en).

Given how new the ONE PIECE TCG is, there aren't many options for players to train and prepare for tournaments online, and MOOgiwara aims to serve the TCG community in this regard.

## Installation for Development
1. `git clone https://github.com/BAA-Studios/MOOgiwara.git`
2. Change directories to `./MOOgiwara/client`
3. `npm install`
4. Change directories to `./MOOgiwara/server`
5. `npm install`
6. Install MongoDB (instructions [here](https://github.com/BAA-Studios/MOOgiwara/wiki/MongoDB-Installation))
7. Use `mongorestore` to initialise the test database (detailed instructions pending)

## Running the web app
1. Change directories to `./MOOgiwara/client`
2. `npm run start` (use `build` instead of `start` to build a production version in `dist/`)
3. Visit link: http://localhost:8000
    - To open dual-client, just open up the same link in another tab/window for a new instance

## Deploying the web app
1. Change directories to `./MOOgiwara/client`
2. `npm run build`
3. `npm run production`

## Running Server
1. Change directories to `./MOOgiwara/server`
2. `npm run start`

## Gallery
![splash_screen](https://user-images.githubusercontent.com/58405975/212563024-b4358915-3ef2-487f-adee-f7132469eaf7.png)
![mulligan](https://user-images.githubusercontent.com/58405975/212563096-c0d31127-ae75-4ccd-94d1-a70e310750da.png)
![game_board](https://user-images.githubusercontent.com/58405975/212563184-b8890c62-96a5-46a6-a5d7-299a64a901bf.png)
![high_res_view_of_card](https://user-images.githubusercontent.com/58405975/213830997-7bc8813c-89b1-480a-b3e6-bcff8a17fee9.png)



## Tech Stack
| Software Tool | Target Version |
| --- | --- |
| Node.js | 19.2.0 |
| npm | 9.1.3 |
| nodemon | 2.0.20 |
| TypeScript| 4.9.3 |
| socket.io | 4.5.4 |
| socket.io-client | 4.5.4 |
| express | 4.18.2 |
| express-session | 1.17.3 |
| cors | 2.8.5 |
| vite | 4.1.4 |
| phaser | 3.60.0-beta.18 |
| shuffle-array | 1.0.1 |
| gts | 4.0.0 |
| google auth library | 8.7.0 |
| mongoose | 7.0.0 |
| [MongoDB Community Edition](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/) | 6.0.4 |
| [MongoDB Shell](https://www.mongodb.com/docs/mongodb-shell/install/) | 1.8.0 |
| [MongoDB Database Tools](https://www.mongodb.com/docs/database-tools/installation/installation-windows/) | 100.7.0 |
