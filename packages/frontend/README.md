# Eve Pingboard React Frontend

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Building and Running the Application
### Prerequisites
You have to install [Node.js](https://nodejs.org/) and [yarn](https://yarnpkg.com/).

### Development
This app was build with [VS Code](https://code.visualstudio.com/).
It is recommended you install the [eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
(for code style hints inside the editor) and [ZipFS](https://marketplace.visualstudio.com/items?itemName=arcanis.vscode-zipfs)
(for support of [yarn's PnP installation strategy](https://yarnpkg.com/features/pnp)) extensions.
When opening the project, Code should ask if you want to install the recommended extensions automatically.

To install all required dev dependencies, run `yarn install`.
Afterwards, run `yarn start` to start the application in dev mode (which includes automatic reloads on code changes). You'll find the application at http://localhost:3000.

Linter warnings and errors will be shown on each re-build of the application.

### Production
To create a production build, run these commands:
```sh
# Install all dependencies
yarn install
# Build the project
yarn build
```
You can find the generated static files in the `./build` directory.

## Accessing the Backend API from the Frontend
The frontend assumes the backend to be reachable at `/auth/*` and `/api/*` routes.

During development, this can be achieved by running the backend on port 3001.
When running the frontend using `yarn start`, all calls to the `/auth` and `/api` routes are automatically proxied to the server running at localhost:3001.

In production, you will need to set up a reverse proxy to route all requests to the `/auth` and `/api` routes to the backend service, while all other requests should go to the frontend.
You should also make sure to route all requests for non-existent frontend files to the `index.html` page, as sub-pages like `/login` will be handled by React rather than there being an actual `login.html` file.
