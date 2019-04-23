import 'reflect-metadata';
import {
    createConnection,
    Connection,
    DatabaseType,
    ConnectionOptions,
    Repository,
    getConnectionManager,
    DefaultNamingStrategy
} from 'typeorm';
import { RelationLoader } from 'typeorm/query-builder/RelationLoader';
import { RelationIdLoader } from 'typeorm/query-builder/RelationIdLoader';
import {User} from '../model/entity/User';
import {LogLevels} from '../controllers/AbstractController';
import {IDao} from './IDao';
import {ServiceError} from '../error/ServiceError';
import {Context} from '../core/Context';

export class TypeOrmDao implements IDao {

    protected _connection: Connection = null;
    protected _host: string;
    protected _port: number;
    protected _database: string;
    protected _username: string;
    protected _pwd: string;
    protected _type: DatabaseType;
    protected _userRepository: Repository<User>;

    protected log(level: LogLevels,
                  message: string,
                  data: Object = null,
                  error: Error = null): void {
        console.log({
            logLevel: level,
            message: message,
            data: data,
            error: error,
        });
    }

    constructor(host: string = 'localhost',
                port: number = 3306,
                database: string = 'test',
                username: string,
                pwd: string,
                type: DatabaseType = 'mysql') {
        this._host = host;
        this._port = port;
        this._database = database;
        this._username = username;
        this._pwd = pwd;
        this._type = type;
    }

    protected injectConnectionOptions(connection: Connection,
                                      options: ConnectionOptions): Connection {
        // @ts-ignore
        connection.options = options;
        // @ts-ignore
        connection.manager = connection.createEntityManager();
        // @ts-ignore
        connection.namingStrategy = connection.options.namingStrategy ||
            new DefaultNamingStrategy();
        // @ts-ignore
        connection.relationLoader = new RelationLoader(connection);
        // @ts-ignore
        connection.relationIdLoader = new RelationIdLoader(connection);
        // @ts-ignore
        connection.buildMetadatas();

        return connection;
    }

    // IMPORTANT!!! read https://github.com/typeorm/typeorm/issues/3427
    // I'm not sure this ORM tool was designed for ephemeral execution environments like Lambda
    // I was able to reproduce this issue simply by running lambda offline
    // running using node was fine, but because the container is dumped with each request in lambda offline
    // this issue surfaced
    public async connect(): Promise<boolean> {
        try {
            this.log(LogLevels.INFO, 'Context.DAO' + Context.DAO);
            const connectionOptions: ConnectionOptions = {
                type: this._type,
                host: this._host,
                port: this._port,
                username: this._username,
                password: this._pwd,
                database: this._database,
                keepConnectionAlive: true,
                entities: [
                    User
                ],
                synchronize: true,
                logging: false
            } as ConnectionOptions;
            const connectionManager = getConnectionManager();

            if (connectionManager.has('default')) {
                this.log(LogLevels.INFO, 'Reusing existion connection...');
                this._connection = this.injectConnectionOptions(
                    connectionManager.get(),
                    connectionOptions,
                );
            } else {
                this.log(LogLevels.INFO, 'Creating new connection...');
                this._connection = connectionManager.create(connectionOptions);
                await this._connection.connect();
            }

            this._userRepository = this._connection.getRepository(User);
            return true;
        } catch (e) {
            this.log(LogLevels.ERROR, 'Could not connect to databse', e.stack, e);
            throw new ServiceError(e.message, 500);
        }
    }

    get connected(): boolean {
        return this._connection === null;
    }

    // TODO: code out persistence methods for user object
    // abstracting these operations into a DAO allows us to cleanly move away from type ORM
    // if I have time I will demonstrate this be creating a new dao and adding a new code to the factory

    async createUser(user: User): Promise<User> {
        // check if any other user has the same email
        try {
            const existingUser: User = await this._userRepository.findOne({email: user.email});
            if (existingUser) {
                // DO not log emails or user ID values to logs! This is a security no no
                this.log(LogLevels.WARN, 'User already exists');
                throw new ServiceError('User already exists', 400);
            }
            // save the user
            await this._userRepository.save(user);
            return user;
        } catch (e) {
            if (e instanceof ServiceError) {
                // rethrow error, this allows us to return 4xx or 5xx based on the error
                throw e;
            }
            this.log(LogLevels.ERROR, 'An error occurred while attempting to add the user', e.stack, e);
            throw new ServiceError(e.message, 500);
        }
    }

    async readUser(user: User): Promise<User> {
        try {
            user = await this._userRepository.findOne({email: user.email});
            if (!user) {
                // DO not log emails or user ID values to logs! This is a security no no
                this.log(LogLevels.WARN, 'User does not exists');
                throw new ServiceError('User does not exists', 400);
            }
            return user;
        } catch (e) {
            if (e instanceof ServiceError) {
                // rethrow error, this allows us to return 4xx or 5xx based on the error
                throw e;
            }
            this.log(LogLevels.ERROR, 'An error occurred while attempting to read the user', e.stack, e);
            throw new ServiceError(e.message, 500);
        }
    }


    async destroy(): Promise<any> {
        this.log(LogLevels.INFO, 'Closing connection');
        await this._connection.close();
        this._userRepository = null;
        this._connection = null;
    }
}
