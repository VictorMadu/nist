import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { Buffer } from "buffer";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import * as _ from "lodash";
import corsPlugin from "fastify-cors";
import { WebSocketServer } from "ws";
import { Injectable } from "../core/injectable";
import { Inject } from "../core/inject";
import { Module } from "../core/module";
import { ServiceAdapter, ControllerAdapter } from "../fastify-adapter";
import { AppBootstrap } from "../fastify-adapter/bootstrap";
import {
  MethodDecos as HttpMethods,
  ParamDecos as HttpParams,
} from "../fastify-adapter/http";
import {
  HttpController,
  MethodDecos as WsMethods,
  ParamDecos as WsParams,
} from "../fastify-adapter/ws";
import { WsController } from "../fastify-adapter/ws/ws.controller";
import { IPayload } from "../fastify-adapter/interfaces/controller.adapter.interfaces";

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
class ServiceOne {
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
    return "md";
  }
}

@HttpController("")
class User {
  constructor(@Inject(ServiceOne) private serviceOne: ServiceOne) {}

  @HttpMethods.OnRequest([async (req: FastifyRequest, rep: FastifyReply) => {}])
  @HttpMethods.Get("")
  getText(
    @HttpParams.Params() params: any,
    @HttpParams.Rep() rep: any,
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
  getText(@HttpParams.Body() body: any, @HttpParams.Rep() rep: any) {
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
    @HttpParams.Body() body: any,
    @HttpParams.Rep() rep: FastifyReply,
    @HttpParams.Req() req: FastifyRequest
  ) {
    rep
      .code(200)
      .send("with path '/feed' " + this.serviceOne.callMe() + " " + rep);
  }
}

@WsController("cat")
class CatWatcher {
  constructor(@Inject(ServiceOne) private serviceOne: ServiceOne) {}

  @WsMethods.SubType(":change")
  handleCatChange(@WsParams.Data() data: any) {
    console.log("cat watcher data", data);
    return {
      type: "cat:change",
      data: { data: data, fromServiceOne: this.serviceOne.callMe() },
    }; // to the ws.send()
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

const appBootstrapper = new AppBootstrap(
  new ServiceAdapter(fastify),
  new ControllerAdapter(fastify)
);

appBootstrapper.start(AppModule as any);
appBootstrapper.emitReady();

const wss = new WebSocketServer({ server: fastify.server });

wss.on("connection", function connection(ws, req) {
  // ws.close();
  ws.on("message", function message(payload: string | Buffer, isBinary) {
    if (isBinary === true) payload = (payload as Buffer).toString("binary");
    const parsedPayload = JSON.parse(payload as string) as IPayload;
    appBootstrapper.handleWsMessage(wss, ws, req, parsedPayload);
  });
  // const data = Buffer.from(JSON.stringify({ data: "data" }), "binary");
  // ws.send(data);
});

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
  appBootstrapper.emitStart();
  console.log("Server listening at", address);
});

fastify.addHook("onClose", () => appBootstrapper.emitClose());