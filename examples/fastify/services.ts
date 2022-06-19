import  { FastifyInstance } from "fastify";
import { Injectable } from "nist-core/injectables";
import {
  ReadyListener,
  StartListener,
  CloseListener,
} from "nist-fastify-adapter/interface/listener.interface";

@Injectable()
export class ServiceOne implements ReadyListener, StartListener, CloseListener {
  private name = "ServiceOne";

  onReady(fastify: FastifyInstance) {
    console.log("called onReady");
  }

  onStart(fastify: FastifyInstance) {
    console.log("called onStart");
  }

  onClose(fastify: FastifyInstance) {
    console.log("called onClose");
  }

  serviceOneMethod() {
    return this.name + " is called";
  }
}

@Injectable()
export class ServiceTwo implements ReadyListener, StartListener, CloseListener {
  private name = "ServiceTwo";

  onReady(fastify: FastifyInstance) {
    console.log("called onReady");
  }

  onStart(fastify: FastifyInstance) {
    console.log("called onStart");
  }

  onClose(fastify: FastifyInstance) {
    console.log("called onClose");
  }

  serviceTwoMethod() {
    return this.name + " is called";
  }
}
