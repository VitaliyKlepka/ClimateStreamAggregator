import { inject } from "inversify";
import { TYPES } from "../../infrastructure/ioc/types";
import { UsersService } from "../../application/Users.service";
import { injectable } from "inversify";
import { HttpAuthGuard } from "./guards/http.guard";
import { WithGuard } from "../../infrastructure/httpServer";
import { Logger } from "../../infrastructure/logger";

@injectable()
export class AuthHandler {

  constructor(
    @inject(TYPES.UsersService) private readonly usersService: UsersService,
    @inject(TYPES.Logger) private readonly logger: Logger,
  ) {
    this.logger.setContext("AuthHandler");
    this.logger.info("✅ AuthHandler initialized");
  }

  public async register(request: any) {
    const { email, password } = request.body;
    this.logger.info(`[register]::request::{${JSON.stringify(request.body)}}`);
    const accessToken = await this.usersService.register(email, password);
    this.logger.info(`[registered]::accessToken::{${accessToken}}`);
    return { accessToken };
  }

  public async login(request: any, reply: any) {
    const { email, password } = request.body;
    const accessToken = await this.usersService.login(email, password);

    this.logger.info(`[login_request]::[${email}]::{${accessToken}}`);
    if (!accessToken) {
      reply.status(401).send('Unauthorized');
      return;
    }
    return { accessToken };
  }

  public async logout(request: any) {
    const { sub } = request.user;
    const status = await this.usersService.logout(sub);
    this.logger.info(`[logout_request]::[${sub}]::{${status}}`);
    return { status };
  }

  public exportMetadata(): Record<string, any>[] {
    return [
      { method: 'POST', path: '/api/login', handler: this.login.bind(this) },
      { method: 'POST', path: '/api/logout', handler: WithGuard(HttpAuthGuard, this.logout.bind(this)) },
      { method: 'POST', path: '/api/register', handler: this.register.bind(this) },
    ];
  }
}
  