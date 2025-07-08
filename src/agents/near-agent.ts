import {
	Agent,
	AgentBuilder,
	McpNearAgent,
	type SamplingHandler,
} from "@iqai/adk";
import { env } from "../env";

export const getNearAgent = async (samplingHandler?: SamplingHandler) => {
	const nearAgentTools = await McpNearAgent({
		samplingHandler,
		env: {
			ACCOUNT_ID: env.ACCOUNT_ID,
			ACCOUNT_KEY: env.ACCOUNT_KEY,
			NEAR_NETWORK_ID: env.NEAR_NETWORK_ID,
			NEAR_NODE_URL: env.NEAR_NODE_URL,
			NEAR_GAS_LIMIT: env.NEAR_GAS_LIMIT,
			DEBUG: env.DEBUG,
		},
	}).getTools();

	const agent = await AgentBuilder.create("near_agent")
		.withDescription(
			"listens to transaction events on chain for agent execution",
		)
		.withModel("gemini-2.0-flash")
		.withTools(...nearAgentTools)
		.build();

	return agent;
};
