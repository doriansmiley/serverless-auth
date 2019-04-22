import {IContext} from "./IContext";
import {IConfig} from "./IConfig";
import {IDao} from "../dao/IDao";

/*
* The Context class is used to sandbox individual requests. It can be expanded to include things like
* injectors, a central event bus, command mapping, etc
* */
export class Context implements IContext{
    private _config: IConfig;

    public static DAO: IDao = null;

    constructor (config:IConfig) {
        this._config = config;
    }

    get config():IConfig {
        return this._config;
    }
}