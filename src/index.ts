import { getNearAgent } from "./agents/near-agent";

async function main() {
	const nearAgent = await getNearAgent();

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
