import { AgentBuilder } from "@iqai/adk";
import { AmountOutCalculatorTool } from "../tools/amount-out-caluculator";

export const getAmmAgent = async () => {
	const AmountOutCalculator = new AmountOutCalculatorTool();

	const agent = await AgentBuilder.create("amm_agent")
		.withDescription(
			"This agent performs automated market making calculations to determine optimal output amounts",
		)
		.withModel("gemini-2.0-flash")
		.withTools(AmountOutCalculator)
		.build();

	return agent;
};
