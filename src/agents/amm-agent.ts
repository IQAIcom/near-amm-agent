import { Agent, createFunctionTool } from "@iqai/adk";
import { JsonRpcProvider } from "near-api-js/lib/providers";
import { env } from "../env";

const provider = new JsonRpcProvider({
	url: env.NEAR_NODE_URL,
});

export const getAmmAgent = () => {
	const ammCalculatorTool = createFunctionTool(calculateAmountOut);

	const agent = new Agent({
		name: "near agent",
		description: "listens to transaction events on chain for agent execution",
		model: "gemini-2.0-flash",
		tools: [ammCalculatorTool],
	});

	return agent;
};

async function calculateAmountOut(
	tokenIn: string,
	tokenOut: string,
	amountIn: number,
) {
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

	if (amount_in > 0 && new_balance_in > 0) {
		const new_balance_out = k / new_balance_in;
		const amount_out = balance_out - new_balance_out;
		return amount_out.toString();
	}

	throw new Error("Illegal amount");
}
