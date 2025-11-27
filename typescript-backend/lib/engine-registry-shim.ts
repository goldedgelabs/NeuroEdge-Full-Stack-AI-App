// simple shim for engine registry usage
export class EngineRegistry {
  static _engines: Record<string, any> = {};
  static register(name: string, impl: any) {
    EngineRegistry._engines[name] = impl;
  }
  static list() {
    return Object.keys(EngineRegistry._engines);
  }
  static get(name: string) {
    return EngineRegistry._engines[name];
  }
}
export default EngineRegistry;
