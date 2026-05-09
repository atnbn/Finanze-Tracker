import jwt from "jsonwebtoken";

const SESSION_MAX_AGE_MS = 60 * 60 * 1000;
const REMEMBER_ME_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const isProduction = process.env.NODE_ENV === "production";

function getCookieSecurityOptions() {
  return {
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };
}

function getAuthMaxAgeMs(rememberMe = false) {
  return rememberMe ? REMEMBER_ME_MAX_AGE_MS : SESSION_MAX_AGE_MS;
}

export function createAuthToken(user, rememberMe = false) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: Math.floor(getAuthMaxAgeMs(rememberMe) / 1000),
  });
}

export function getAuthCookieOptions(rememberMe = false) {
  return {
    httpOnly: true,
    ...getCookieSecurityOptions(),
    maxAge: getAuthMaxAgeMs(rememberMe),
  };
}

export function getClearAuthCookieOptions() {
  return {
    httpOnly: true,
    ...getCookieSecurityOptions(),
    maxAge: 0,
  };
}
