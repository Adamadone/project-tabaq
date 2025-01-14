This is a copy of a semestral project "TabaQ" created by me (Adam Zacios), Kryštof Řezáč, Alexandr Kuryshev and Jan Ligač. This copy has been created for portfolio building purposes.

It is currently hosted on a server and freely accessible here: [TabaQ](https://tabaq.krystof-rezac.cz/)


# How to start developing

Things you need to have installed:
- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/en)

## Start backend

In order to spin up the backend, open a shell instance in the /src/backend directory and execute command
```shell
docker compose up --watch
```
This will start both the database and api on ports 5432 and 80 respectively. When using the `--watch` flag, docker will automatically watch for any changes in the source code and restart when necessary. If you make any changes in the `init.sql` script and you wish for those changes to be reflected in the database, you will have to delete the `src/backend/data` directory (this will delete any data stored up to this point) and restart the docker watch server with the --build flag like so 
```shell
docker compose up --watch --build
```

## Start frontend

To start the frontend dev server, open a shell instance in the /src/frontend directory and execute the following commands
```shell
npm ci # This will install necessary dependencies

npm run dev # This will start a developement server using Vite
```
Once the dev server is started, you can open the frontend app in your browser using localhost:3000
