import {User} from '../model/entity/User';

export interface IDao {
    connect(): Promise<boolean>;
    createUser(user: User): Promise<User>;
    readUser(user:User): Promise<User>;
    destroy(): Promise<any>;
}
