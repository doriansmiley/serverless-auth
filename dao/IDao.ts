export interface IDao {
    connect(): Promise<boolean>;
}