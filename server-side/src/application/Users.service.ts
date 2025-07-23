import { inject, injectable } from "inversify";
import { TYPES } from "../infrastructure/ioc/types";
import { DataSource, MoreThan, Repository } from "typeorm";
import { UserEntity } from "../domain/user/entities/User.entity";
import { UserSessionEntity } from "../domain/user/entities/UserSession.entity";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { config } from "../config";

@injectable()
export class UsersService {

  private readonly userSessionRepository: Repository<UserSessionEntity>;
  private readonly userRepository: Repository<UserEntity>;

  constructor(
    @inject(TYPES.AppDataSource) private readonly dataSource: DataSource,
  ) {
    this.userSessionRepository = this.dataSource.getRepository(UserSessionEntity);
    this.userRepository = this.dataSource.getRepository(UserEntity);
    console.log("✅ UsersService initialized");
  }

  public async register(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.userRepository.save({ email, password: hashedPassword });

    return newUser;
  }

  public async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }
    try {
      const token = jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, { expiresIn: '1h' });

      await this.userSessionRepository.save({
        user_id: user.id,
        payload: token,
        expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });

      return token;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async logout(userId: number) {
    try {
      await this.userSessionRepository.update({ user_id: userId }, { expires_at: new Date() });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public async getUserActiveSession(userId: number) {
    return this.userSessionRepository.findOne({ where: { user_id: userId, expires_at: MoreThan(new Date()) } });
  }
}

