const env = {
    PORT: process.env.PORT || 3000,
  
    API_KEY: process.env.API_KEY,
  
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