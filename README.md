# ViteVueSocketIoChat

Simple Socket IO chat made with Vue (Vite).

## How it works?

The project is composed by 2 elements: one server and one client.

The server handles clients connections and messages.

The clients connects to server in order to send and receive message to and from other connected clients.

## How to build?

Simply prompt `docker compose up`.

You can also detach console with `docker compose up -d`.

## How to use it?

Open at least one tab in browser to `localhost:8080` and start chat with others clients.

In order to add clients, connect to the same host as previous.

You can use up to 64 clients to chat.
