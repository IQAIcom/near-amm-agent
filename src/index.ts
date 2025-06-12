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

	console.log("Starting event listener...");

	// Start listening
	await nearAgent.run({
		messages: [
			{
				role: "user",
				content: "Listen 'amm.iqai.near' contract for 'run_agent' events.",
			},
		],
	});

	// Keep the process alive indefinitely
	while (true) {
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
}

main().catch(console.error);
