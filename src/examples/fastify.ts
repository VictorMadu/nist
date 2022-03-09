import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import {
  Get,
  HttpController,
  Inject,
  Injectable,
  Module,
  Post,
  Put,
} from "../core";
import { AppBootstrapper } from "../core/app-bootstrapper";
import { IModule } from "../core/interface/module.interface";
import ControllerAdapter from "../fastify-adapter/controller-adapter";
import { ServiceAdapter } from "../fastify-adapter/service-adapter";
import * as _ from "lodash";
import {
  Body,
  Params,
  Rep,
  RepData,
} from "../fastify-adapter/param-decorators";
import {
  IParams,
  IRep,
} from "../fastify-adapter/interface/http-handler-args.interface";
import { OnRequest } from "../fastify-adapter/method-decorators";
import { setReqOrRepData } from "../fastify-adapter/data-manager";

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

@HttpController("")
class User {
  constructor(@Inject(ServiceOne) private serviceOne: ServiceOne) {}
  @OnRequest([
    async (req: FastifyRequest, rep: FastifyReply) => {
      setReqOrRepData(rep, "f", "f");
    },
  ])
  @Get("")
  getText(
    @Params() params: IParams,
    @Rep() rep: IRep,
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
  getText(@Body() body: {}, @Rep() rep: IRep) {
    rep
      .code(200)
      .send("with path '/feed' " + this.serviceOne.callMe() + " " + rep);
  }
}

@HttpController("/cat")
class Cat {
  constructor(@Inject(ServiceOne) private serviceOne: ServiceOne) {}
  @Put()
  getText(@Body() body: {}, @Rep() rep: IRep) {
    rep
      .code(200)
      .send("with path '/feed' " + this.serviceOne.callMe() + " " + rep);
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
