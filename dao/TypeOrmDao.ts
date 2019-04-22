import 'reflect-metadata';
import {createConnection, Connection, DatabaseType, ConnectionOptions} from 'typeorm';
import {User} from '../model/entity/User';
import {LogLevels} from '../controllers/AbstractController';
import {IDao} from './IDao';

export class TypeOrmDao implements IDao {

    protected _connection:Connection = null;
    protected _host:string;
    protected _port:number;
    protected _database:string;
    protected _username:string;
    protected _pwd:string;
    protected _type:DatabaseType;

    protected log(level:LogLevels,
                  message:string,
                  data:Object = null,
                  error:Error = null):void {
        console.log({
            logLevel: level,
            message: message,
            data: data,
            error: error,
        });
    }

    constructor(host:string = 'localhost',
                port:number = 3306,
                database:string = 'test',
                username:string,
                pwd:string,
                type:DatabaseType = 'mysql') {
        this._host = host;
        this._port = port;
        this._database = database;
        this._username = username;
        this._pwd = pwd;
        this._type = type;
    }

    public async connect():Promise<boolean> {
        try {
            this._connection = await createConnection({
                type: this._type,
                host: this._host,
                port: this._port,
                username: this._username,
                password: this._pwd,
                database: this._database,
                entities: [
                    User
                ],
                synchronize: true,
                logging: false
            } as ConnectionOptions);
            return true;
        } catch (e) {
            this.log(LogLevels.ERROR, 'Could not connect to databse', e.stack, e);
            return false;
        }
    }

    get connected():boolean {
        return this._connection === null;
    }

    // TODO: code out persistence methods for user object
    // abstracting these operations into a DAO allows us to cleanly move away from type ORM
    // if I have time I will demonstrate this be creating a new dao and adding a new code to the factory
}