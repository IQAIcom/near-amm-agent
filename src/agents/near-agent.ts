import { Agent, McpToolset, createSamplingHandler } from "@iqai/adk";
import { env } from "../env";
import { getAmmAgent } from "./amm-agent";

export const getNearAgent = async () => {
	const ammAgent = getAmmAgent();

	const samplingHandler = createSamplingHandler(async (request) => {
		try {
			const response = await ammAgent.run({
				messages: request.messages,
			});

			return {
				content: response.content || "",
				model: "gemini-2.0-flash",
				stopReason: "",
			};
		} catch (error) {
			console.error("❌ Error in sampling handler:", error);
			throw error;
		}
	});

	const nearAgentToolSet = new McpToolset({
		name: "Near Agent MCP Client",
		description: "Near Agent MCP to watch near chain transactions",
		debug: env.DEBUG,
		retryOptions: { maxRetries: 2, initialDelay: 200 },
		samplingHandler,
		transport: {
			mode: "stdio",
			command: "npx",
			args: ["-y", "@iqai/mcp-near-agent"],
			env: {
				ACCOUNT_ID: env.ACCOUNT_ID,
				ACCOUNT_KEY: env.ACCOUNT_KEY,
				NEAR_NETWORK_ID: env.NEAR_NETWORK_ID,
				NEAR_NODE_URL: env.NEAR_NODE_URL,
				NEAR_GAS_LIMIT: env.NEAR_GAS_LIMIT,
			},
		},
	});

	const nearAgentTools = await nearAgentToolSet.getTools();

	const agent = new Agent({
		name: "near agent",
		description: "listens to transaction events on chain for agent execution",
		model: "gemini-2.0-flash",
		tools: nearAgentTools,
	});

	return agent;
};
