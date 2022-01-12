# PosApp

## Front-end client [Github](https://github.com/cnava9389/PosApp/tree/main/TS-Client)

## Go Api backend [Github](https://github.com/cnava9389/PosApp/tree/main/goApi)

The root of the directory contains the docker files needed to setup the backend and to create the postgres database from a 
container as well as the folder needed to setup the nginx server. The reverse proxy server sets up a container that will 

basically serve the goApi from port 80 of the container. The go container is able to communicate with the postrges container

through the use of docker-compose. Lastly, the .toml file is there because the frontend is served with netlify while all the 
docker containers are served from a digital ocean droplet.