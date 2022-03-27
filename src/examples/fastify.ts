import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import * as _ from "lodash";
import corsPlugin from "fastify-cors";
import { Injectable } from "../core/injectable";
import { Inject } from "../core/inject";
import { Module } from "../core/module";
import { AppBootstrap } from "../fastify-adapter/bootstrap";
import {
  HttpController,
  MethodDecos as HttpMethods,
  ParamDecos as HttpParams,
} from "../fastify-adapter/http";
import {
  WsController,
  MethodDecos as WsMethods,
  ParamDecos as WsParams,
} from "../fastify-adapter/ws";

import {
  ICloseListener,
  IReadyListener,
  IStartListener,
} from "fastify-adapter/interfaces/service.interface";
import { WebSocket } from "ws";

const configFile = fs.readFileSync(
  path.join(
    process.cwd(),
    process.env.NODE_ENV === "test" ? "config.test.yaml" : "config.yaml"
  ),
  { encoding: "utf-8" }
);

const yamlLoadedConfigFile = yaml.load(configFile) as Record<string, any>;

const KEY = fs.readFileSync(
  path.join(_.get(yamlLoadedConfigFile, "app.key") as string)
);
const CERT = fs.readFileSync(
  path.join(_.get(yamlLoadedConfigFile, "app.cert") as string)
);

const fastify = Fastify({
  // https: {
  //   key: KEY,
  //   cert: CERT,
  // },
  logger: true,
});

fastify.ready(() => {
  console.log("\nPrinting the plugins");
  console.log(fastify.printPlugins());
});
fastify.ready(() => {
  console.log("\nPrinting the routes");
  console.log(
    fastify.printRoutes({
      includeHooks: true,
      includeMeta: ["metaProperty"],
      commonPrefix: false,
    })
  );
});

@Injectable()
class ServiceOne implements IReadyListener, IStartListener, ICloseListener {
  private foo = "foo";

  onReady(fastify: FastifyInstance) {
    console.log("called onReady");
  }

  onStart(fastify: FastifyInstance) {
    console.log("called onStart");
  }

  onClose(fastify: FastifyInstance) {
    console.log("called onClose");
  }

  callMe() {
    return this.foo + " md";
  }
}

@HttpController()
class User {
  constructor(@Inject(ServiceOne) private serviceOne: ServiceOne) {}

  @HttpMethods.OnRequest([async (req: FastifyRequest, rep: FastifyReply) => {}])
  @HttpMethods.Get()
  getText(
    @HttpParams.Params() params: FastifyRequest["params"],
    @HttpParams.Rep() rep: FastifyReply,
    @HttpParams.RepData() repData: { f: string }
  ) {
    rep
      .code(200)
      .send("with path '/' " + this.serviceOne.callMe() + " " + repData);
  }
}

@HttpController("/feed")
class Feed {
  constructor(@Inject(ServiceOne) private serviceOne: ServiceOne) {}

  @HttpMethods.Post()
  getText(
    @HttpParams.Body() body: FastifyRequest["body"],
    @HttpParams.Rep() rep: FastifyReply
  ) {
    rep
      .code(200)
      .send("with path '/feed' " + this.serviceOne.callMe() + " " + rep);
  }
}

@HttpController("/cat")
class Cat {
  constructor(@Inject(ServiceOne) private serviceOne: ServiceOne) {}

  @HttpMethods.Put()
  getText(
    @HttpParams.Body() body: FastifyRequest["body"],
    @HttpParams.Rep() rep: FastifyReply,
    @HttpParams.Req() req: FastifyRequest
  ) {
    rep
      .code(200)
      .send("with path '/feed' " + this.serviceOne.callMe() + " " + rep);
  }
}

@WsController("cat", "cat", () => true)
class CatWatcher {
  constructor(@Inject(ServiceOne) private serviceOne: ServiceOne) {}

  @WsMethods.Type(":change")
  handleCatChange(@WsParams.Data() data: any) {
    console.log("cat watcher data", data);
    return {
      type: "cat:change",
      data: { data: data, fromServiceOne: this.serviceOne.callMe() },
    }; // to the ws.send()
  }

  // TODO:: Implement a ws.send param method for both buffer and string response
  @WsMethods.Type(":change2")
  @WsMethods.Path("/change")
  @WsMethods.Auth(() => false)
  handleCatChange2(@WsParams.Data() data: any, @WsParams.Ws() ws: WebSocket) {
    console.log("cat watcher data", data);
    ws.send(
      JSON.stringify({
        type: "cat:change",
        data: { data: data, fromServiceOne: this.serviceOne.callMe() },
      })
    ); // to the ws.send()
  }
}

@Module({
  imports: [],
  controllers: [Cat, CatWatcher],
  services: [ServiceOne],
  exports: [ServiceOne],
})
class CatModule {}

@Module({
  imports: [CatModule],
  controllers: [User, Feed],
  services: [],
  exports: [],
})
class UserModule {}

@Module({
  imports: [CatModule, UserModule],
  controllers: [],
  services: [],
  exports: [],
})
class AppModule {}

const appBootstrapper = new AppBootstrap(fastify, new AppModule() as any);
const serviceEventHandler = appBootstrapper.getServiceEventHandler();

appBootstrapper.createWs("ws://localhost:8080");
serviceEventHandler.emitReady();

// TODO: Add cors for specific controllers. Create the function
fastify.register(corsPlugin, {
  origin: (origin, cb) => {
    console.log("\n\nOrigin", origin);
    if (/.*?/.test(origin)) return cb(null, true);
    return cb(null, true);
    // return cb(new Error("Not allowed"), false);
  },
});

fastify.listen(8080, "127.0.0.1", (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  serviceEventHandler.emitStart();
  console.log("Server listening at", address);
});

fastify.addHook("onClose", () => serviceEventHandler.emitClose());
