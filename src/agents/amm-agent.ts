import { Agent } from "@iqai/adk";
import { AmountOutCalculatorTool } from "../tools/amount-out-caluculator";

export const getAmmAgent = () => {
	const AmountOutCalculator = new AmountOutCalculatorTool();

	const agent = new Agent({
		name: "amm_agent",
		description:
			"This agent performs automated market making calculations to determine optimal output amounts",
		model: "gemini-2.0-flash",
		tools: [AmountOutCalculator],
	});

	return agent;
};
