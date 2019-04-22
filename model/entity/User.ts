import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({
        length: 26
    })
    firstName: string;
    @Column({
        length: 26
    })
    lastName: string;
    @Column()
    email: string;
    @Column({
        length: 26
    })
    username: string;
    @Column({
        length: 64
    })
    password: string;
}