import { getRepository, Repository, QueryFailedError } from "typeorm";
import { User } from "./entity";
import bcrypt from "bcrypt";
import { NotFoundError, WrongInputError } from "../shared/errors";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";

export interface IUserService {
  getUser(email: string): Promise<User>;
  login(email: string, password: string): void;
  signup(email: string, password: string): Promise<string>;
}

export class UserService implements IUserService {
  userRepo: Repository<User>;
  constructor() {
    this.userRepo = getRepository(User);
  }

  /**
   * Get user from database
   * @param email Email
   * @throws {NotFoundError} user is not found
   * @throws {Error} Uncaught Error
   */
  public async getUser(email: string): Promise<User> {
    let user;
    try {
      user = await this.userRepo.findOneOrFail({
        email: email,
      });
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        throw new NotFoundError("User is not found");
      }
      throw err;
    }
    return user;
  }

  /**
   * Attempt to log in a user, else throw error if 
   * 1. User doesn't exist
   * 2. Password doesn't match
   * @param email 
   * @param password 
   * @throws {WrongInputError} Wrong password
   * @throws {NotFoundError} user is not found
   * @throws {Error} Uncaught Error
   */
  public async login(email: string, password: string) {
    let user = await this.getUser(email);
    const res = await bcrypt.compare(password, user.password);
    if (!res) {
      throw new WrongInputError(`Wrong password for ${email}`);
    }
  }

  /**
   * Create a new user, otherwise throw error
   * @param email 
   * @param password 
   * @throws {WrongInputError} Email is in use
   * @throws {Error} Uncaught Error
   */
  public async signup(email: string, password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 10);
    let user;
    try {
      user = await this.userRepo.save({
        email: email,
        password: hashedPassword,
      });
    } catch (err) {
      if (err instanceof QueryFailedError) {
        let errCode = (err as any).code as string;
        switch (errCode) {
          case "ER_DUP_ENTRY": {
            throw new WrongInputError("email has already been used.");
          }
          default:
            throw err;
        }
      }
      throw err;
    }
    return user.email;
  }
}
