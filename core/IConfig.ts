export interface IConfig {
    serviceCode: string; // used for assigning a concrete service implementation
    serviceMap: Object; // hash to look up routes
    getURLWithParams(serviceName: string, route: string, args?: Array<string>): string;
    getAbsoluteURLWithParams(serviceName: string, route: string, args?: Array<string>): string;
}
