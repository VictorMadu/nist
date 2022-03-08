export interface IAdapter<
  T extends Record<string | symbol, any> = Record<string | symbol, any>
> {
  attach: (config: T) => void;
}
