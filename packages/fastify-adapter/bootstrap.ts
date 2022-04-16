import { FastifyInstance } from "fastify";
import { HttpAdapter } from "./http-adapter";
import { ServiceAdapter } from "../core/service-adapter";
import { WsAdapter } from "./ws-adapter";

export class Bootstrap {
  private serviceAdapter: ServiceAdapter;
  private httpAdapter: HttpAdapter;
  private wsAdapter: WsAdapter;

  constructor(private fastify: FastifyInstance) {
    this.serviceAdapter = new ServiceAdapter(this.fastify);
    this.httpAdapter = new HttpAdapter(this.fastify);
    this.wsAdapter = new WsAdapter(this.fastify);
  }

  load() {
    this.serviceAdapter.resolve();
    this.httpAdapter.resolve();
    this.wsAdapter.resolve();
    this.serviceAdapter.ready();
  }

  emitStart() {
    this.serviceAdapter.start();
  }

  emitClose() {
    this.serviceAdapter.close();
  }
}
