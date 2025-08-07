import { model } from "@/env";
import { AgentBuilder, type SamplingHandler } from "@iqai/adk";
import { getNearAgentTools } from "./tools";

export const getNearAgent = async (samplingHandler?: SamplingHandler) => {
	const nearAgentTools = await getNearAgentTools(samplingHandler);

	const agent = await AgentBuilder.create("near_agent")
		.withDescription(
			"listens to transaction events on chain for agent execution",
		)
		.withModel(model)
		.withTools(...nearAgentTools)
		.build();

	return agent;
};
