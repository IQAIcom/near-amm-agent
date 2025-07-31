import { model } from "@/env";
import { AgentBuilder } from "@iqai/adk";
import { AmountOutCalculatorTool } from "./tools";

export const getAmmAgent = async () => {
	const tool = new AmountOutCalculatorTool();
	const agent = await AgentBuilder.create("amm_agent")
		.withDescription(
			"This agent performs automated market making calculations to determine optimal output amounts. You only respond with output amount. nothing else.",
		)
		.withModel(model)
		.withTools(tool)
		.build();

	return agent;
};
