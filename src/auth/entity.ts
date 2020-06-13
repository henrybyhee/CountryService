import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 200, unique: true })
  email: string;

  @Column("varchar", { length: 200 })
  password: string;
}

export enum TokenUse {
  ACCESS = "access",
  REFRESH = "refresh",
}

// Ensure that user only has one valid pair at any given time
@Entity()
export class UserToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 200 })
  email: string;

  @Column("text")
  token: string;

  @Column("enum", { enum: TokenUse })
  use: TokenUse;

  @Column("boolean", { default: false })
  revoked: boolean;
}
