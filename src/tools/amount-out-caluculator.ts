import { BaseTool } from "@iqai/adk";
import { JsonRpcProvider } from "near-api-js/lib/providers";
import { env } from "../env";

const provider = new JsonRpcProvider({
	url: env.NEAR_NODE_URL,
});

export class AmountOutCalculatorTool extends BaseTool {
	constructor() {
		super({
			name: "amount_out_calculator",
			description:
				"Calculates the amount out for a token swap using AMM constant product formula.",
		});
	}

	getDeclaration() {
		return {
			name: this.name,
			description: this.description,
			parameters: {
				type: "object",
				properties: {
					tokenIn: {
						type: "string",
						description: "Input token address",
					},
					tokenOut: {
						type: "string",
						description: "Output token address",
					},
					amountIn: {
						type: "number",
						description: "Amount of input token to swap",
					},
				},
				required: ["tokenIn", "tokenOut", "amountIn"],
			},
		};
	}

	async runAsync(args: {
		tokenIn: string;
		tokenOut: string;
		amountIn: number;
	}) {
		console.log("Running amount_out_calculator tool");
		console.log("Token in:", args.tokenIn);
		console.log("Token out:", args.tokenOut);
		console.log("Amount in:", args.amountIn);

		try {
			const balances = (await provider.callFunction(
				"amm-iqai.near",
				"get_swap_balances",
				{
					token_in: args.tokenIn,
					token_out: args.tokenOut,
				},
			)) as [string, string];

			const balance_in = BigInt(balances[0]);
			const balance_out = BigInt(balances[1]);
			const amount_in = BigInt(args.amountIn);

			const k = balance_in * balance_out;
			const new_balance_in = balance_in + amount_in;

			if (amount_in > 0 && new_balance_in > 0) {
				const new_balance_out = k / new_balance_in;
				const amount_out = balance_out - new_balance_out;

				return {
					amountOut: amount_out.toString(),
					tokenIn: args.tokenIn,
					tokenOut: args.tokenOut,
					amountIn: args.amountIn.toString(),
				};
			}

			throw new Error("Illegal amount");
		} catch (error) {
			return {
				error: `Failed to calculate amount out: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
		}
	}
}
