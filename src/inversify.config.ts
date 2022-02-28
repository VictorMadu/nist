// file inversify.config.ts

import { Container } from "inversify";
import { Warrior, Weapon, ThrowableWeapon } from "./interfaces";
import { Ninja, Katana, Shuriken } from "./entities";
import { TYPES } from "./_types";

const myContainer = new Container({ defaultScope: "Singleton" });
myContainer.bind<Warrior>((Ninja as any).$KEY).to(Ninja);
myContainer.bind<Weapon>((Katana as any).$KEY).to(Katana);
myContainer.bind<ThrowableWeapon>((Shuriken as any).$KEY).to(Shuriken);

export { myContainer };
