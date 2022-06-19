import * as fs from "fs";
import WebSocket from "ws";
import _ from "lodash";
import { Inject } from "nist-core/injectables";
import {
  SendFn,
  SendRawFn,
} from "nist-fastify-adapter/injectables/interface/ws.param.decorator.interface";
import { WsController, setWsConfig } from "nist-fastify-adapter/injectables/ws-controller";
import * as WsMethods from "nist-fastify-adapter/injectables/ws.method.decorators";
import * as WsParams from "nist-fastify-adapter/injectables/ws.param.decorators";
import { ServiceOne } from "../services";
import { ConfigFile } from "../config-file";

@WsController()
export class CatWs {
  constructor(@Inject(ServiceOne) private serviceOne: ServiceOne) {}

  @WsMethods.Type(":change")
  handleCatChange(@WsParams.Payload() data: any, @WsParams.Ws() ws: WebSocket) {
    console.log("cat watcher data", data);
    ws.send(
      JSON.stringify({
        type: "cat:change",
        data: { data: data, fromServiceOne: this.serviceOne.serviceOneMethod() },
      })
    );
  }
  @WsMethods.Type("")
  handleCatChange2(
    @WsParams.Payload() data: any,
    @WsParams.Ws() ws: WebSocket,
    @WsParams.Send() send: SendFn,
    @WsParams.SendRaw() sendRaw: SendRawFn
  ) {
    const filePath = <string>ConfigFile.get("app.filePath");
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
