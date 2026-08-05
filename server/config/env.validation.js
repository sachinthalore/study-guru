import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),

  API_KEY: z.string().min(1),

  MONGODB_URI: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(32),

  JWT_REFRESH_SECRET: z.string().min(32),

  ACCESS_TOKEN_EXPIRES: z.string(),

  REFRESH_TOKEN_EXPIRES: z.string(),

  NODE_ENV: z.enum(["development", "production"]).default("development"),

  SMTP_HOST: z.string(),

SMTP_PORT: z.string(),

SMTP_USER: z.string().email(),

SMTP_PASS: z.string().min(1),

FRONTEND_URL: z.string().url(),

});


const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export default parsed.data;

