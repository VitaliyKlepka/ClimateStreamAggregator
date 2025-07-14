import { CandlesticksHandler } from "../domain/candlestick/Candlesticks.handler"
import { HealthCheckHandler } from "../domain/health/Healthcheck.handler"
import { TYPES } from "./ioc/types"
import { Container } from "inversify"

// TODO: [Auth] - import { verifyAuth } from '../domain/auth/guard';

interface IHttpTransport {
  listen: (params: Record<string, any>, cb?: (err: any, addr: any) => void) => void // Should be improved as other transports(Express.js etc.) has different signatures for the method
  get: (path: string, handler: (request: any, reply: any) => void) => void
  post: (path: string, handler: (request: any, reply: any) => void) => void
  put: (path: string, handler: (request: any, reply: any) => void) => void
  delete: (path: string, handler: (request: any, reply: any) => void) => void
}

enum EServerStatus {
  STARTED = 'STARTED',
  STOPPED = 'STOPPED',
}

export class HttpServer {

  private status: EServerStatus = EServerStatus.STOPPED;

  private readonly params: Record<string, any>;

  private readonly transport: IHttpTransport;

  private ioc: Container; // Inversion Of Controll container

  constructor(
    params: Record<string, any>,
    trasport: IHttpTransport,
    ioc: Container
  ) {
    this.transport = trasport;
    this.params = params;
    this.ioc = ioc;
  }

  public async stop() {
    if (this.status === EServerStatus.STOPPED) {
      console.error("[ERROR]::Server is already stopped.");
      process.exit(1);
    }
    this.status = EServerStatus.STOPPED;
    console.log("🚀 Server stopped");
  }

  public async start() {
    if (!this.transport) {
      console.error("[ERROR]::HTTP Trasport not provided.");
      process.exit(1);
    }

    if (this.status === EServerStatus.STARTED) {
      console.error("[ERROR]::Server is already started.");
      process.exit(1);
    }

    this.applyHandlers();

    this.transport.listen(
      { port: this.params?.port, host: this.params?.host },
      (err, addr) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        this.status = EServerStatus.STARTED;
        console.log(`🚀 Server ready at ${addr}`);
      }
    );
  }

  public applyHandlers() {
    const candlesticksHandler = this.ioc.get<CandlesticksHandler>(TYPES.CandlesticksHandler);

    const handlersMetadata = [
      ...HealthCheckHandler.exportMetadata(),
      ...candlesticksHandler.exportMetadata(),
    ];

    handlersMetadata.forEach(hm => {
      console.log(`✅ Registered handler: ${hm.method} - ${hm.path}`);
      switch (hm.method) {
        case 'GET': this.transport.get(hm.path, hm.handler); break;
        case 'POST': this.transport.post(hm.path, hm.handler); break;
        case 'PUT': this.transport.put(hm.path, hm.handler); break;
        case 'DELETE': this.transport.delete(hm.path, hm.handler); break;
        default:
          console.error(`[ERROR]::Unknown HTTP method: ${hm.method}`);
          process.exit(1);
      }
    });
  }

}

