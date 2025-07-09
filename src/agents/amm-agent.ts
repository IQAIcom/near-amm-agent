import { AgentBuilder } from "@iqai/adk";
import { env } from "../env";
import { AmountOutCalculatorTool } from "../tools/amount-out-caluculator";

export const getAmmAgent = async () => {
	const AmountOutCalculator = new AmountOutCalculatorTool();

	const agent = await AgentBuilder.create("amm_agent")
		.withDescription(
			"This agent performs automated market making calculations to determine optimal output amounts. You only respond with output amount. nothing else.",
		)
		.withModel(env.LLM_MODEL)
		.withQuickSession("amm_agent", "user")
		.withTools(AmountOutCalculator)
		.build();

	return agent;
};
