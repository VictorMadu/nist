import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import corsPlugin from "fastify-cors";
import { WebSocketServer } from "ws";
import ControllerAdapter, {
  HttpController,
  WsController,
} from "../fastify-adapter/controller-adapter";
import { Injectable } from "../core/injectable";
import { Inject } from "../core/inject";
import {
  Get,
  OnRequest,
  Post,
  Put,
  SubType,
} from "../fastify-adapter/methods-decorators";
import {
  Body,
  Params,
  Rep,
  RepData,
} from "../fastify-adapter/param-decorators";
import { Module } from "../core/module";
import { ServiceAdapter } from "../fastify-adapter/service-adapter";
import { AppBootstrap } from "../fastify-adapter/bootstrap";
import * as _ from "lodash";

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

  @OnRequest([async (req: FastifyRequest, rep: FastifyReply) => {}])
  @Get("")
  getText(
    @Params() params: any,
    @Rep() rep: any,
    @RepData() repData: { f: string }
  ) {
    rep
      .code(200)
      .send("with path '/' " + this.serviceOne.callMe() + " " + repData);
  }
}

@HttpController("/feed")
class Feed {
  constructor(@Inject(ServiceOne) private serviceOne: ServiceOne) {}
  @Post()
  getText(@Body() body: any, @Rep() rep: any) {
    rep
      .code(200)
      .send("with path '/feed' " + this.serviceOne.callMe() + " " + rep);
  }
}

@HttpController("/cat")
class Cat {
  constructor(@Inject(ServiceOne) private serviceOne: ServiceOne) {}
  @Put()
  getText(@Body() body: any, @Rep() rep: any) {
    rep
      .code(200)
      .send("with path '/feed' " + this.serviceOne.callMe() + " " + rep);
  }
}

@WsController(":cat")
class CatWatcher {
  constructor(@Inject(ServiceOne) private serviceOne: ServiceOne) {}

  @SubType(":change")
  handleCatChange(data: any, isBinary: boolean) {
    return { data, fromServiceOne: this.serviceOne.callMe() }; // to the ws.send()
  }
}

@Module({
  imports: [],
  controllers: [Cat],
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

wss.on("connection", function connection(ws) {
  // ws.close();
  ws.on("message", function message(payload: { type: string; data: any }) {
    console.log("received: %s", payload);
    appBootstrapper.handleWsMessage(wss, ws, payload);
  });

  const isBinary = true;
  const data = JSON.stringify({ data: "data" });
  ws.send(data, { binary: isBinary });
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
