import { injectable } from "inversify";

@injectable()
export class Logger {

  private readonly logger: any;

  private context?: string;

  constructor() {
    // any suitable logging provider (e.g. console, winston, pino with configured storage like Loki under the hood)
    this.logger = console;
    console.log("✅ Logger initialized");
  }

  public setContext(context: string) {
    this.context = context;
  }

  public info(message: string) {
    this.logger.log(`[${this.context}]:[INFO] ${message}`);
  }

  public error(message: string) {
    this.logger.error(`[${this.context}]:[ERROR] ${message}`);
  }

  public debug(message: string) {
    this.logger.debug(`[${this.context}]:[DEBUG] ${message}`);
  }
}


