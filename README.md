# Eve Pingboard
An application combining and extending the functionality of the [Ping App](https://github.com/bravecollective/ping-app) and [Timerboard](https://github.com/bravecollective/neucore-timerboard), built on top of [Neucore](https://github.com/bravecollective/neucore).

## Building and Running the Application
### Dependencies
The only dependencies to run the application are [Node.js](https://nodejs.org/) and [yarn](https://yarnpkg.com/).

### Development
This app was build with [VS Code](https://code.visualstudio.com/).
It is recommended you install the [eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
(for code style hints inside the editor) and [ZipFS](https://marketplace.visualstudio.com/items?itemName=arcanis.vscode-zipfs)
(for support of [yarn's PnP installation strategy](https://yarnpkg.com/features/pnp)) extensions.
When opening the project, Code should ask if you want to install the recommended extensions automatically.

To install all required dev dependencies, run `yarn install`.
Afterwards, run `yarn dev` to start the application in dev mode (which includes automatic restarts on code changes).

You can run code style checks with `yarn lint`. To fix automatically fixable issues, run `yarn lint:fix`.

### Production
For running in production, run these commands:
```sh
# Install all dev dependencies
yarn install
# Build the project
yarn build
# Run the application
yarn start
```

To clean the built `.js` files, run `yarn clean`.
