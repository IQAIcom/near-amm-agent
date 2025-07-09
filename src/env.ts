import { config } from "dotenv";
import { z } from "zod";

config();

type KeyPairString = `ed25519:${string}` | `secp256k1:${string}`;

const keyPairSchema = z.custom<KeyPairString>(
	(val) => {
		if (typeof val !== "string") return false;
		return val.startsWith("ed25519:") || val.startsWith("secp256k1:");
	},
	{
		message: "ACCOUNT_KEY must start with 'ed25519:' or 'secp256k1:'",
	},
);
export const envSchema = z.object({
	DEBUG: z.coerce.boolean().default(false),
	GOOGLE_API_KEY: z.string(),
	AGENT_ACCOUNT_ID: z.string(),
	AGENT_ACCOUNT_KEY: keyPairSchema,
	USER_ACCOUNT_ID: z.string().optional(),
	USER_ACCOUNT_KEY: keyPairSchema.optional(),
	NEAR_NETWORK_ID: z.string().default("mainnet"),
	NEAR_NODE_URL: z.string().default("https://rpc.web4.near.page/account/near"),
	NEAR_GAS_LIMIT: z.string().default("300000000000000"),
	PATH: z.string(),
});

export const env = envSchema.parse(process.env);
