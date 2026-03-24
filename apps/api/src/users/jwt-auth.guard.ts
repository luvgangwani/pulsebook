import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  ACCESS_TOKEN_EXPIRED_MESSAGE,
  AUTHENTICATION_REQUIRED_MESSAGE,
  INVALID_ACCESS_TOKEN_MESSAGE,
} from "./constants";

type RequestLike = {
  headers?: {
    authorization?: string;
    cookie?: string;
  };
  user?: AuthenticatedUser;
};

export type AuthenticatedUser = {
  sub: string;
  email: string;
  role_id: number;
  role_name: string;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestLike>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException(AUTHENTICATION_REQUIRED_MESSAGE);
    }

    request.user = this.verifyAccessToken(token);
    return true;
  }

  private extractToken(request: RequestLike) {
    const authorizationHeader = request.headers?.authorization;

    if (authorizationHeader?.startsWith("Bearer ")) {
      return authorizationHeader.slice("Bearer ".length).trim();
    }

    const cookieHeader = request.headers?.cookie;

    if (!cookieHeader) {
      return null;
    }

    const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
    const accessTokenCookie = cookies.find((cookie) =>
      cookie.startsWith(`${ACCESS_TOKEN_COOKIE_NAME}=`),
    );

    if (!accessTokenCookie) {
      return null;
    }

    return decodeURIComponent(
      accessTokenCookie.slice(`${ACCESS_TOKEN_COOKIE_NAME}=`.length),
    );
  }

  private verifyAccessToken(token: string): AuthenticatedUser {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const [header, body, signature] = token.split(".");

    if (!header || !body || !signature) {
      throw new UnauthorizedException(INVALID_ACCESS_TOKEN_MESSAGE);
    }

    const expectedSignature = createHmac("sha256", secret)
      .update(`${header}.${body}`)
      .digest("base64url");

    const actualSignature = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (
      actualSignature.length !== expectedSignatureBuffer.length ||
      !timingSafeEqual(actualSignature, expectedSignatureBuffer)
    ) {
      throw new UnauthorizedException(INVALID_ACCESS_TOKEN_MESSAGE);
    }

    let payload: AuthenticatedUser & { exp?: number };

    try {
      payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as
        | (AuthenticatedUser & { exp?: number });
    } catch {
      throw new UnauthorizedException(INVALID_ACCESS_TOKEN_MESSAGE);
    }

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.role_id !== "number" ||
      typeof payload.role_name !== "string"
    ) {
      throw new UnauthorizedException(INVALID_ACCESS_TOKEN_MESSAGE);
    }

    if (typeof payload.exp !== "number" || payload.exp <= Date.now() / 1000) {
      throw new UnauthorizedException(ACCESS_TOKEN_EXPIRED_MESSAGE);
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role_id: payload.role_id,
      role_name: payload.role_name,
    };
  }
}
