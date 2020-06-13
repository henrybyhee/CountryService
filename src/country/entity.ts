import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 200 })
  name: string;

  @Column("varchar", { length: 200 })
  timezone: string;

  @Column("varchar", { length: 2 })
  code: string;

  @Column("int")
  offset: number;
}
