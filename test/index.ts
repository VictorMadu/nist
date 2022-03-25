import { myContainer } from "./inversify.config";
import { TYPES } from "./types";
import { Warrior } from "./interfaces";
import { Ninja } from "./entities";

const ninja = myContainer.get<Warrior>(TYPES.Warrior);

console.log(ninja.fight()); //"cut!"
console.log(ninja.sneak()); //"hit!"

console.log(ninja.constructor === Ninja);
