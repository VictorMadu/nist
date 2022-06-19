import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import * as _ from "lodash";

export class ConfigFile {
  private static loadedConfigFile: Record<string, any>;

  static load() {
    const configFile = ConfigFile.getConfigFile();
    ConfigFile.loadedConfigFile = yaml.load(configFile) as Record<string, any>;
  }

  static get(innerKey: string) {
    const loadedConfigFile = ConfigFile.loadedConfigFile;
    if (!loadedConfigFile) throw new Error("Config File not loaded");
    return _.get(loadedConfigFile, innerKey);
  }

  private static getConfigFile() {
    return fs.readFileSync(
      path.join(
        process.cwd(),
        process.env.NODE_ENV === "test" ? "config.test.yaml" : "config.yaml"
      ),
      { encoding: "utf-8" }
    );
  }
}
