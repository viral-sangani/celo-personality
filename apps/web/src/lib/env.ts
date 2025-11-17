import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// https://env.t3.gg/docs/nextjs
export const env = createEnv({
  server: {
    JWT_SECRET: z.string().min(1).optional().default("build-time-placeholder"),
    POAP_API_KEY: z
      .string()
      .min(1)
      .optional()
      .default("build-time-placeholder"),
    POAP_CLIENT_ID: z
      .string()
      .min(1)
      .optional()
      .default("build-time-placeholder"),
    POAP_CLIENT_SECRET: z
      .string()
      .min(1)
      .optional()
      .default("build-time-placeholder"),
    POAP_EVENT_ID_MINI_APP_MAXI: z.coerce.number().optional().default(0),
    POAP_EVENT_ID_VERIFIED_HUMAN: z.coerce.number().optional().default(0),
    POAP_EVENT_ID_IMPACT_REGEN: z.coerce.number().optional().default(0),
    POAP_EVENT_ID_L2_BELIEVER: z.coerce.number().optional().default(0),
    POAP_EVENT_ID_STABLECOIN_SAVVY: z.coerce.number().optional().default(0),
    POAP_SECRET_CODE_MINI_APP_MAXI: z
      .string()
      .min(1)
      .optional()
      .default("build-time-placeholder"),
    POAP_SECRET_CODE_VERIFIED_HUMAN: z
      .string()
      .min(1)
      .optional()
      .default("build-time-placeholder"),
    POAP_SECRET_CODE_IMPACT_REGEN: z
      .string()
      .min(1)
      .optional()
      .default("build-time-placeholder"),
    POAP_SECRET_CODE_L2_BELIEVER: z
      .string()
      .min(1)
      .optional()
      .default("build-time-placeholder"),
    POAP_SECRET_CODE_STABLECOIN_SAVVY: z
      .string()
      .min(1)
      .optional()
      .default("build-time-placeholder"),
  },
  client: {
    NEXT_PUBLIC_URL: z
      .string()
      .min(1)
      .optional()
      .default("http://localhost:3000"),
    NEXT_PUBLIC_APP_ENV: z
      .enum(["development", "production"])
      .optional()
      .default("development"),
    NEXT_PUBLIC_FARCASTER_HEADER: z
      .string()
      .optional()
      .default("build-time-placeholder"),
    NEXT_PUBLIC_FARCASTER_PAYLOAD: z
      .string()
      .optional()
      .default("build-time-placeholder"),
    NEXT_PUBLIC_FARCASTER_SIGNATURE: z
      .string()
      .optional()
      .default("build-time-placeholder"),
    NEXT_PUBLIC_EVENT_SECRET_CODE: z.string().optional().default(""),
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  experimental__runtimeEnv: {
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_FARCASTER_HEADER: process.env.NEXT_PUBLIC_FARCASTER_HEADER,
    NEXT_PUBLIC_FARCASTER_PAYLOAD: process.env.NEXT_PUBLIC_FARCASTER_PAYLOAD,
    NEXT_PUBLIC_FARCASTER_SIGNATURE:
      process.env.NEXT_PUBLIC_FARCASTER_SIGNATURE,
    NEXT_PUBLIC_EVENT_SECRET_CODE: process.env.NEXT_PUBLIC_EVENT_SECRET_CODE,
  },
});
