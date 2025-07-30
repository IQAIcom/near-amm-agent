import { env } from "@/env";
import { createTool } from "@iqai/adk";
// import * as z from "zod";
import { JsonRpcProvider } from "near-api-js/lib/providers";

const provider = new JsonRpcProvider({
	url: env.NEAR_NODE_URL,
});

export const amountOutCalculator = createTool({
	name: "amount_out_calculator",
	description:
		"Calculates the amount out for a token swap using AMM constant product formula.",
	// schema: z.object({
	// 	tokenIn: z.string().describe("Input token address"),
	// 	tokenOut: z.string().describe("Output token address"),
	// 	amountIn: z.number().describe("Amount of input token to swap"),
	// }),
	fn: async ({ tokenIn, tokenOut, amountIn }) => {
		try {
			const balances = (await provider.callFunction(
				"amm-iqai.near",
				"get_swap_balances",
				{
					token_in: tokenIn,
					token_out: tokenOut,
				},
			)) as [string, string];

			const balance_in = BigInt(balances[0]);
			const balance_out = BigInt(balances[1]);
			const amount_in = BigInt(amountIn);

			const k = balance_in * balance_out;
			const new_balance_in = balance_in + amount_in;

			if (amount_in > 0n && new_balance_in > 0n) {
				const new_balance_out = k / new_balance_in;
				const amount_out = balance_out - new_balance_out;

				return {
					amountOut: amount_out.toString(),
					tokenIn,
					tokenOut,
					amountIn: amountIn,
				};
			}

			throw new Error("Illegal amount");
		} catch (error) {
			return {
				error: `Failed to calculate amount out: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
		}
	},
});
