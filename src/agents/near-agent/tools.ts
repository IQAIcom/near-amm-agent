import { env } from "@/env";
import { McpNearAgent, type SamplingHandler } from "@iqai/adk";

export const getNearAgentTools = async (samplingHandler?: SamplingHandler) => {
	const nearAgentTools = await McpNearAgent({
		samplingHandler,
		env: {
			ACCOUNT_ID: env.AGENT_ACCOUNT_ID,
			ACCOUNT_KEY: env.AGENT_ACCOUNT_KEY,
			NEAR_NETWORK_ID: env.NEAR_NETWORK_ID,
			NEAR_NODE_URL: env.NEAR_NODE_URL,
			NEAR_GAS_LIMIT: env.NEAR_GAS_LIMIT,
			DEBUG: env.DEBUG,
		},
	}).getTools();

	return nearAgentTools;
};
