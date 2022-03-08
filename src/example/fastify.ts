import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { Get, HttpController, Inject, Injectable, Module } from "../core";
import { AppBootstrapper } from "../core/app-bootstrapper";
import { IModule } from "../core/interface/module.interface";
import ControllerAdapter from "../fastify-adapter/controller-adapter";
import { ServiceAdapter } from "../fastify-adapter/service-adapter";
import * as _ from "lodash";

const fastify = Fastify();

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

@HttpController()
class User {
  constructor(@Inject(ServiceOne) private serviceOne: ServiceOne) {}
  @Get()
  getText(req: FastifyRequest, rep: FastifyReply) {
    rep.code(200).send("with path '/' " + this.serviceOne.callMe());
  }
}

@HttpController("/feed")
class Feed {
  constructor(@Inject(ServiceOne) private serviceOne: ServiceOne) {}
  @Get()
  getText(req: FastifyRequest, rep: FastifyReply) {
    rep.code(200).send("with path '/feed' " + this.serviceOne.callMe());
  }
}

@HttpController("/cat")
class Cat {
  constructor(@Inject(ServiceOne) private serviceOne: ServiceOne) {}
  @Get()
  getText(req: FastifyRequest, rep: FastifyReply) {
    rep.code(200).send("with path '/cat' " + this.serviceOne.callMe());
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

const appBootstrapper = new AppBootstrapper(
  new ServiceAdapter(fastify),
  new ControllerAdapter(fastify)
);

appBootstrapper.start(AppModule);
appBootstrapper.emitReady();

fastify.listen(8080, "127.0.0.1", (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  appBootstrapper.emitStart();
  console.log("Server listening at", address);
});

fastify.addHook("onClose", () => appBootstrapper.emitClose());

let m: {} = {};
_.set(m, "[1]", "f");
console.log("clogging m", m);
console.log("testing ", (m as any)[1]);
