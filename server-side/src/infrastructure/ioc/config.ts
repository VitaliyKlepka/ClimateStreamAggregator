import { Container } from "inversify";
import { TYPES } from "./types";
import { CandlestickService } from "../../application/Candlestick.service";
import { CandlesticksHandler } from "../../domain/candlestick/Candlesticks.handler";
import { AppDataSource } from "../../infrastructure/db/database";
import { DataSource } from "typeorm";
import { AggregationService } from "../../application/Aggregation.service";
import { RedisBuffer } from "../../infrastructure/redis";
import { UsersService } from "../../application/Users.service";
import { AuthHandler } from "../../domain/auth/Auth.handler";
import { Logger } from "../../infrastructure/logger";

const iocContainer = new Container();
iocContainer.bind<CandlestickService>(TYPES.CandlestickService).to(CandlestickService);
iocContainer.bind<DataSource>(TYPES.AppDataSource).toConstantValue(AppDataSource);
iocContainer.bind<AggregationService>(TYPES.AggregationService).to(AggregationService);
iocContainer.bind<CandlesticksHandler>(TYPES.CandlesticksHandler).to(CandlesticksHandler);
iocContainer.bind<UsersService>(TYPES.UsersService).to(UsersService);
iocContainer.bind<AuthHandler>(TYPES.AuthHandler).to(AuthHandler);
iocContainer.bind<RedisBuffer>(TYPES.RedisBuffer).to(RedisBuffer).inSingletonScope();
iocContainer.bind<Logger>(TYPES.Logger).to(Logger);

export { iocContainer };
