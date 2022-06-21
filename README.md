# Nist

It’s a framework that encapsulates web frameworks just like Nest JS does, to write a backend application using OOP principles with Typescript and following the controller -> service -> repository (db and external services) architecture pattern (where controller depends on service, service on repository and changes to controller does not affect service, changes to service does not affect repository). You can write an adapter for frameworks such as: Express. There is a [fastify-adapter](packages/fastify-adapter) already. This framework also comes with a [websocket utility](packages/ws-manager). 

You can check how to use with fastify [here](examples/fastify).

This framework is used in [brate-server](https://github.com/VictorMadu/brate-server)

Sadly I am considering abandoning this project because this cannot be used in production and It is complicated, disorganized and needs an entire restructure and better documentation and I dont have time for it.

