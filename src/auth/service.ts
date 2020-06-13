import { User } from "./entity";
import { TokenService } from "./token.service";
import { ITokenService, ITokens, IPayload } from "./token.interface";
import { IUserService, UserService } from "./user.service";

export class AuthService {
  tokenService: ITokenService;
  userService: IUserService;

  constructor() {
    this.tokenService = new TokenService(
      process.env.JWT_ISSUER,
      process.env.JWT_SECRET_FOR_ACCESS_TOKEN,
      process.env.JWT_SECRET_FOR_REFRESH_TOKEN,
      Number(process.env.JWT_EXPIRY_ACCESS_TOKEN_IN_SEC) || 300,
      Number(process.env.JWT_EXPIRY_REFRESH_TOKEN_IN_SEC) || 1209600,
    );
    this.userService = new UserService();
  }

  /**
   * Creates a user and generate token.
   * @param email 
   * @param pwd 
   * @throws {WrongInputError} Email is in use
   * @throws {Error} Uncaught Error
   */
  public async signup(email: string, pwd: string): Promise<ITokens> {
    try {
      await this.userService.signup(email, pwd);
    } catch (err) {
      console.log(err);
      throw err;
    }
    // Generate New Tokens
    const tokens = await this.tokenService.generateTokens(email);
    return tokens;
  }

  /**
   * Login a user by matching his password, then generate access and refresh tokens.
   * @param email 
   * @param pwd
   * @throws {WrongInputError} Wrong password
   * @throws {NotFoundError} user is not found
   * @throws {Error} Uncaught Error
   */
  public async login(email: string, pwd: string): Promise<ITokens> {
    try {
      await this.userService.login(email, pwd);
    } catch (err) {
      throw err;
    }
    // Generate tokens
    const tokens = await this.tokenService.generateTokens(email);
    return tokens;
  }

  /**
   * Verify refresh token:
   * - Token exists
   * - Token is not revoked
   * - Token is valid
   * - Token use is correct
   * - User exists
   * 
   * Then generate access token.
   * @param refreshToken 
   * @throws {NotFoundError} Token not found
   * @throws {TokenVerifyError} Token is revoked or verification failed.
   * @throws {Error} Uncaught Error
   */
  public async refresh(refreshToken: string): Promise<ITokens> {
    let payload: IPayload;
    let user: User;
    try {
      payload = await this.tokenService.verifyRefreshToken(refreshToken);
      user = await this.userService.getUser(payload.user);
    } catch (err) {
      throw err;
    }
    const accessToken = await this.tokenService.generateAccessToken(user.email);
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  /**
   * Verify access token
   * @param accessToken 
   * @throws {NotFoundError} Token not found
   * @throws {TokenVerifyError} Token is revoked or verification failed.
   * @throws {Error} Uncaught Error
   */
  public async authenticate(accessToken: string): Promise<void> {
    let payload: IPayload;
    let user: User;
    try {
      payload = await this.tokenService.verifyAccessToken(accessToken);
      user = await this.userService.getUser(payload.user);
    } catch (err) {
      throw err;
    }
  }
}
