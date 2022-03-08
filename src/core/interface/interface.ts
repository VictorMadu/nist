export interface IAnyMethod {
  [key: string]: (...args: any[]) => any;
}
