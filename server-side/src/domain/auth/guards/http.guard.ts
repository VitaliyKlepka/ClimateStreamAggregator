import { config } from "../../../config";
import jwt from "jsonwebtoken";
import { Container } from "inversify";
import { TYPES } from "../../../infrastructure/ioc/types";
import { UsersService } from "../../../application/Users.service";

export const HttpAuthGuard = async (request: any, reply: any, handler: any, ioc?: Container) => {
  const bearerToken = request.headers['authorization'];

  if (!bearerToken) {
    reply.status(401).send('Unauthorized');
    return;
  }
  const jwtToken = bearerToken.split(' ')[1];
  if (!jwtToken) {
    reply.status(401).send('Unauthorized');
    return;
  }

  try {
    const decodedToken: Record<string, any> = jwt.verify(jwtToken, config.jwtSecret) as Record<string, any>;

    if (!decodedToken) {
      reply.status(401).send('Unauthorized');
      return;
    }

    if (decodedToken.exp < Date.now() / 1000) {
      reply.status(401).send('Unauthorized');
      return;
    }

    const payload: Record<string, any> = decodedToken;

    if (ioc) {
      const usersService = ioc.get<UsersService>(TYPES.UsersService);
      const userSession = await usersService.getUserActiveSession(payload.sub);
      if (!userSession) {
        reply.status(401).send('Unauthorized');
        return;
      }
      if (userSession.payload !== jwtToken) {
        reply.status(401).send('Unauthorized');
        return;
      }
      if (userSession.expires_at < new Date()) {
        reply.status(401).send('Unauthorized');
        return;
      }
    }

    request.user = payload;

    return handler(request, reply);

  } catch (error) {
    reply.status(401).send('Unauthorized');
    return;
  }
};

