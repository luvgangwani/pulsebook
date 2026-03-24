export const ACCESS_TOKEN_COOKIE_NAME = "access_token";
export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;
export const AUTHENTICATION_REQUIRED_MESSAGE = "Authentication required.";
export const INVALID_ACCESS_TOKEN_MESSAGE = "Invalid access token.";
export const ACCESS_TOKEN_EXPIRED_MESSAGE = "Access token has expired.";
export const ALLOWED_ROLES_METADATA_KEY = "allowed_roles";

export const EMAIL_LOGIN_FAILURE_MESSAGE = "No user registered with this email.";
export const PASSWORD_LOGIN_FAILURE_MESSAGE = "Incorrect password.";

export const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
};
