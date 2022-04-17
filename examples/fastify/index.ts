import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import * as _ from "lodash";
import corsPlugin from "fastify-cors";
import { WebSocket } from "ws";
import { Injectable, Inject } from "nist-core/injectables";
import { Bootstrap } from "nist-fastify-adapter";
import { HttpController } from "nist-fastify-adapter/injectables/http-controller";
import { WsController, setWsConfig } from "nist-fastify-adapter/injectables/ws-controller";
import * as HttpMethods from "nist-fastify-adapter/injectables/http.method.decorators";
import * as HttpParams from "nist-fastify-adapter/injectables/http.param.decorators";
import * as WsMethods from "nist-fastify-adapter/injectables/ws.method.decorators";
import * as WsParams from "nist-fastify-adapter/injectables/ws.param.decorators";
import {
  ReadyListener,
  StartListener,
  CloseListener,
} from "nist-fastify-adapter/interface/listener.interface";
import {
  SendRawFn,
  SendFn,
} from "nist-fastify-adapter/injectables/interface/ws.param.decorator.interface";

const configFile = fs.readFileSync(
  path.join(process.cwd(), process.env.NODE_ENV === "test" ? "config.test.yaml" : "config.yaml"),
  { encoding: "utf-8" }
);

const yamlLoadedConfigFile = yaml.load(configFile) as Record<string, any>;

const fastify = Fastify({
  // https: {
  //   key: KEY,
  //   cert: CERT,
  // },
  logger: true,
});

const bootstrap = new Bootstrap(fastify);

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
class ServiceOne implements ReadyListener, StartListener, CloseListener {
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

  @HttpMethods.OnRequest([
    async (req: FastifyRequest, rep: FastifyReply) => {
      rep.header("Access-Control-Allow-Origin", "*");
      rep.header("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, PATCH, DELETE");
      rep.header("Access-Control-Max-Age", "300");
    },
  ])
  @HttpMethods.QueryStringSchema({
    type: "object",
    properties: {
      f: { type: "number" },
    },
    required: ["f"],
    additionalProperties: false,
  } as const)
  @HttpMethods.Get()
  getText(
    @HttpParams.Params() params: FastifyRequest["params"],
    @HttpParams.Rep() rep: FastifyReply,
    @HttpParams.RepData() repData: { f: string }
  ) {
    rep.code(200).send("with path '/' " + this.serviceOne.callMe() + " " + repData);
  }
}

@HttpController("/feed")
class Feed {
  constructor(@Inject(ServiceOne) private serviceOne: ServiceOne) {}

  @HttpMethods.Post()
  getText(@HttpParams.Body() body: FastifyRequest["body"], @HttpParams.Rep() rep: FastifyReply) {
    rep.code(200).send("with path '/feed' " + this.serviceOne.callMe() + " " + rep);
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
    rep.code(200).send("with path '/feed' " + this.serviceOne.callMe() + " " + rep);
  }

  @HttpMethods.Put("/list")
  getTexts(
    @HttpParams.Body() body: FastifyRequest["body"],
    @HttpParams.Rep() rep: FastifyReply,
    @HttpParams.Req() req: FastifyRequest
  ) {
    rep.code(200).send("with path '/feed' " + this.serviceOne.callMe() + " " + rep);
  }
}

@WsController()
class CatWs {
  constructor(@Inject(ServiceOne) private serviceOne: ServiceOne) {}

  @WsMethods.Type(":change")
  handleCatChange(@WsParams.Data() data: any, @WsParams.Ws() ws: WebSocket) {
    console.log("cat watcher data", data);
    ws.send(
      JSON.stringify({
        type: "cat:change",
        data: { data: data, fromServiceOne: this.serviceOne.callMe() },
      })
    );
  }

  @WsMethods.Type(":change2")
  handleCatChange2(
    @WsParams.Data() data: any,
    @WsParams.Ws() ws: WebSocket,
    @WsParams.Send() send: SendFn,
    @WsParams.SendRaw() sendRaw: SendRawFn
  ) {
    console.log("cat watcher data", data);
    const filePath = _.get(yamlLoadedConfigFile, "app.filePath") as string;
    const source = fs.createReadStream(filePath);

    source.on("data", (chunk) => {
      console.log("emitted data", chunk?.constructor);
      sendRaw(chunk);
    });

    source.on("close", () => {
      console.log("emitted finished");
      send("finished", "ended");
    });
  }
}

setWsConfig(
  {
    path: "/cats",
    type: "cat",
    authAndGetUserDetails: () => ({}),
    heartbeat: 4000,
  },
  [CatWs]
);

// TODO: Add cors for specific controllers. Create the function
fastify.register(corsPlugin, {
  origin: (origin, cb) => {
    console.log("\n\nOrigin", origin);
    if (/.*?/.test(origin)) return cb(null, true);
    return cb(null, true);
    // return cb(new Error("Not allowed"), false);
  },
});

bootstrap.load();
fastify.listen(8080, "127.0.0.1", (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  bootstrap.emitStart();
  console.log("Server listening at", address);
});

fastify.addHook("onClose", () => bootstrap.emitClose());
