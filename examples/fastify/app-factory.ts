import fastify from "fastify";
import corsPlugin from "fastify-cors";
import { Bootstrap } from "nist-fastify-adapter/bootstrap";

export class AppServerFactory {
  private fastify = this.getFastifyInstance();

  static start() {
    new AppServerFactory()
      .printPluginWhenReady()
      .printRoutesWhenReady()
      .addCorsPlugin()
      .startServer();
  }

  private getFastifyInstance() {
    return fastify({
      // https: {
      //   key: KEY,
      //   cert: CERT,
      // },
      logger: true,
    });
  }

  private printPluginWhenReady() {
    this.fastify.ready(() => {
      console.log("\nPrinting the plugins");
      console.log(this.fastify.printPlugins());
    });
    return this;
  }

  private printRoutesWhenReady() {
    this.fastify.ready(() => {
      console.log("\nPrinting the routes");
      console.log(
        this.fastify.printRoutes({
          includeHooks: true,
          includeMeta: ["metaProperty"],
          commonPrefix: false,
        })
      );
    });
    return this;
  }

  private addCorsPlugin() {
    this.fastify.register(corsPlugin, {
      origin: (origin, cb) => {
        console.log("\n\nOrigin", origin);
        if (/.*?/.test(origin)) return cb(null, true);
        return cb(null, true);
        // return cb(new Error("Not allowed"), false);
      },
    });
    return this;
  }

  private startServer() {
    const bootstrap = new Bootstrap(this.fastify);
    bootstrap.load();
    this.fastify.listen(8080, "127.0.0.1", (err, address) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      bootstrap.emitStart();
      console.log("Server listening at", address);
    });

    this.fastify.addHook("onClose", () => bootstrap.emitClose());

    return this;
  }
}
