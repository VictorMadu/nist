import { ConstructorReturnType } from "../types";
// import { IServiceDecoConstructor, IAdapter, ILoader } from "./interface";
import { Loader } from "./_loader";

// type IAdapterT<T extends IServiceDecoConstructor> = IAdapter<
//   ConstructorReturnType<T>
// >;

// export class ServiceLoader<
//   T extends IServiceDecoConstructor = IServiceDecoConstructor
// > extends Loader<T> implements ILoader<T, IAdapterT<T>> {
//   constructor(private serviceAdapter: IAdapterT<T>) {
//     super();
//   }

//   load(service: ConstructorReturnType<T>) {
//     this.serviceAdapter.attach(service);
//   }
// }
