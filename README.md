# Webidea

This repository contains the Water Awareness Portal with a full Node.js backend for:

- user authentication
- file uploads (images/videos)
- community gallery
- group chat

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open in browser:
   ```
   http://127.0.0.1:3000
   ```

## Deploy to a Node host

This project is ready to deploy to a Node host like Render, Railway, or Heroku.

### Render

1. Push this repository to GitHub.
2. Create a new Web Service on Render.
3. Connect the `main` branch.
4. Use `npm install` as the build command and `npm start` as the start command.
5. Render will provision a public URL for your full backend app.

### Heroku / Railway

- Heroku: add a `Procfile` and deploy the repo.
- Railway: connect the repo and set `npm start`.

## GitHub Pages

A static preview is published to GitHub Pages, but backend features do not work there. Use the deployment above for login, uploads, and chat.
