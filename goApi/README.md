## go api

This api was re-implemented with golang to take advantage of its concurrency and speed.

As of right now I have a monolith api but will get to breaking down the services into microservers and fully utilize docker
with that. For now this nodejs, and express like api takes care of sign in, creation of all objects, logout, item retrievals

and so on..., basic POS functionality. I used fiber for the super fast http server and I use gorm to simplify and ease the
development process of creating objects and storing them into the database. The db.go file in models has a small database

wraper around gorm for my own ease of use.

### Pos frontend [Github](https://github.com/cnava9389/PosApp/tree/main/TS-Client)