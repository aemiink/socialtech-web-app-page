process.env.NODE_ENV = "test";
process.env.JWT_ACCESS_SECRET ??= "test-access-secret-minimum-32-characters";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret-minimum-32-characters";
process.env.JWT_ACCESS_EXPIRES_IN ??= "15m";
process.env.JWT_REFRESH_EXPIRES_IN ??= "7d";
process.env.REFRESH_TOKEN_COOKIE_NAME ??= "socialtech_refresh_token";
process.env.BCRYPT_SALT_ROUNDS ??= "10";
