import { Inject } from "nist-core/injectables";
import * as HttpMethods from "nist-fastify-adapter/injectables/http.method.decorators";
import * as HttpParams from "nist-fastify-adapter/injectables/http.param.decorators";
import { HttpController } from "nist-fastify-adapter/injectables/http-controller";
import { FastifyRequest, FastifyReply } from "fastify";
import { ServiceOne, ServiceTwo } from "../services";

const queryStringSchema = {
  type: "object",
  properties: {
    f: { type: "number" },
  },
  required: ["f"],
  additionalProperties: false,
} as const;

function corsAllowAll(rep: FastifyReply) {
  rep.header("Access-Control-Allow-Origin", "*");
  rep.header("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, PATCH, DELETE");
  rep.header("Access-Control-Max-Age", "300");
}

@HttpController()
export class User {
  constructor(@Inject(ServiceOne) private serviceOne: ServiceOne) {}

  @HttpMethods.Get("/") // GET Method
  @HttpMethods.OnRequest([async (req: FastifyRequest, rep: FastifyReply) => corsAllowAll(rep)])
  @HttpMethods.QueryStringSchema(queryStringSchema)
  getUser(
    @HttpParams.Params() params: FastifyRequest["params"],
    @HttpParams.Rep() rep: FastifyReply,
    @HttpParams.RepData() repData: { f: string }
  ) {
    rep
      .code(200)
      .send(
        `this.serviceOne.serviceOneMethod called with result => ${this.serviceOne.serviceOneMethod()}.\nrepData => ${repData}`
      );
  }
}

@HttpController("/feed")
export class Feed {
  constructor(private serviceOne: ServiceOne, private serviceTwo: ServiceTwo) {}

  @HttpMethods.Post("/:id") // POST Method
  @HttpMethods.OnRequest([
    async (req: FastifyRequest, rep: FastifyReply) => {
      /* Perform asynchronous task */
    },
  ])
  getFeed(
    @HttpParams.Body() body: FastifyRequest["body"],
    @HttpParams.Rep() rep: FastifyReply,
    @HttpParams.Params() params: any
  ) {
    rep
      .code(200)
      .send(
        `this.serviceOne.serviceOneMethod called with result => ${this.serviceOne.serviceOneMethod()}.\nthis.serviceTwo.serviceTwoMethod called with result => ${this.serviceTwo.serviceTwoMethod()}. Req params => ${JSON.stringify(
          params
        )}. Req body => ${JSON.stringify(body)}`
      );
  }
}

@HttpController("/cat")
export class Cat {
  constructor(
    @Inject(ServiceOne) private serviceOne: ServiceOne,
    @Inject(ServiceTwo) private serviceTwo: ServiceTwo
  ) {}

  @HttpMethods.Put() // PUT Method
  getCat(
    @HttpParams.Body() body: FastifyRequest["body"],
    @HttpParams.Rep() rep: FastifyReply,
    @HttpParams.Req() req: FastifyRequest
  ) {
    rep
      .code(200)
      .send(
        `this.serviceOne.serviceOneMethod called with result => ${this.serviceOne.serviceOneMethod()}.\nthis.serviceTwo.serviceTwoMethod called with result => ${this.serviceTwo.serviceTwoMethod()}. Req body => ${body}`
      );
  }

  @HttpMethods.Put("/list") // Another PUT Method
  getCats(
    @HttpParams.Body() body: FastifyRequest["body"],
    @HttpParams.Rep() rep: FastifyReply,
    @HttpParams.Req() req: FastifyRequest
  ) {
    rep
      .code(200)
      .send(
        `this.serviceOne.serviceOneMethod called with result => ${this.serviceOne.serviceOneMethod()}.\nthis.serviceTwo.serviceTwoMethod called with result => ${this.serviceTwo.serviceTwoMethod()}. Req body => ${body}`
      );
  }
}
