import { createSamplingHandler } from "@iqai/adk";
import { getAmmAgent } from "./agents/amm-agent";
import { getNearAgent } from "./agents/near-agent";

async function main() {
	const ammAgent = getAmmAgent();

	const samplingHandler = createSamplingHandler((request) =>
		ammAgent.run({
			messages: request.messages,
		}),
	);

	const nearAgent = await getNearAgent(samplingHandler);

	console.log("ℹ️ Starting event listener...");

	// Start listening
	const output = await nearAgent.run({
		messages: [
			{
				role: "user",
				content:
					"With 'watch_near_event' tool, Watch for 'run_agent' events on 'amm.iqai.near' contract. for response call agent_response method and poll every 10s",
			},
		],
	});

	console.log("📠 Assistant: ", output.content);

	// Keep the process alive indefinitely
	while (true) {
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
}

main().catch(console.error);
