import {IDao} from './IDao';
import {TypeOrmDao} from './TypeOrmDao';
import {DatabaseType} from 'typeorm';

export class DaoFactory {

    public getDAO(code:string):IDao {
        switch (code) {
            case 'mysql':
                return new TypeOrmDao(
                    process.env.DB_HOST,
                    parseInt(process.env.DB_PORT),
                    process.env.DB_NAME,
                    process.env.DB_USER,
                    process.env.DB_PWD,
                    process.env.DB_TYPE as DatabaseType
                );
            default:
        }
        throw new Error(`No DAO for code ${code}`);
    }
}