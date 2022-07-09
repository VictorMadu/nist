import { FastifyInstance } from "fastify";
import { HttpAdapter } from "./http-adapter";
import { ServiceAdapter } from "victormadu-nist-core";
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

  async load() {
    this.serviceAdapter.resolve();
    this.httpAdapter.resolve();
    this.wsAdapter.resolve();
    await this.serviceAdapter.ready();
  }

  async emitStart() {
    await this.serviceAdapter.start();
  }

  async emitClose() {
    await this.serviceAdapter.close();
  }
}
