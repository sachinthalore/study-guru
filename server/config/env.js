const env = {
  PORT: process.env.PORT || 3000,

  API_KEY: process.env.API_KEY,

  MONGODB_URI: process.env.MONGODB_URI,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,

  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES,

  REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES,

  NODE_ENV: process.env.NODE_ENV || "development",
  
  CLIENT_ORIGINS: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://localhost:3000",
    "https://study-guru-pi.vercel.app",
  ],

  RATE_LIMIT_WINDOW: 15 * 60 * 1000,

  RATE_LIMIT_MAX: 100,
};

export default env;