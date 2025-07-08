import { type BuiltAgent, type Event, createSamplingHandler } from "@iqai/adk";
import * as cron from "node-cron";
import { getAmmAgent } from "./agents/amm-agent";
import { getNearAgent } from "./agents/near-agent";
import { startServer } from "./server";

const CONTRACT_ADDRESS = "amm.iqai.near";
const EVENT_TYPE = "run_agent";
const POLLING_INTERVAL = "*/5 * * * *"; // Every 5 minutes

async function main() {
	try {
		// Start the health check server (bypass gcp health check)
		startServer();

		// Initialize agents
		const { nearAgent } = await initializeAgents();

		// Setup initial event listener
		await setupEventListener(nearAgent);

		// Start periodic status checking
		startCronJob(nearAgent);

		console.log("🚀 Near AMM Agent is now running!");
	} catch (error) {
		console.error("💥 Failed to start Near AMM Agent:", error);
		process.exit(1);
	}
}

async function setupEventListener(nearAgent: BuiltAgent) {
	console.log("ℹ️ Setting up event listener...");

	if (!nearAgent.runner || !nearAgent.session) {
		throw new Error("Runner or session not found");
	}

	const output = await waitForRunAsyncCompletion(
		nearAgent.runner.runAsync({
			userId: "user-1",
			sessionId: nearAgent.session.id,
			newMessage: {
				role: "user",
				parts: [
					{
						text: "Initialize event listener for AMM agent",
					},
				],
			},
		}),
	);

	console.log("📠 Initial Setup:", output);
}

function startCronJob(nearAgent: BuiltAgent) {
	console.log("ℹ️ Starting cron job for event monitoring...");

	cron.schedule(POLLING_INTERVAL, () => checkEventStatus(nearAgent));

	console.log("✅ Cron job scheduled to run every 5 minutes");
}

async function checkEventStatus(nearAgent: BuiltAgent) {
	try {
		console.log(`🔍 Checking for ${EVENT_TYPE} events...`);

		if (!nearAgent.runner || !nearAgent.session) {
			throw new Error("Runner or session not found");
		}

		const statusOutput = await waitForRunAsyncCompletion(
			nearAgent.runner.runAsync({
				userId: "user-1",
				sessionId: nearAgent.session.id,
				newMessage: {
					role: "user",
					parts: [
						{
							text: `Check status for '${EVENT_TYPE}' events on '${CONTRACT_ADDRESS}' contract and provide current status. Include statistics!`,
						},
					],
				},
			}),
		);

		console.log("📠 Status Update:", statusOutput);
	} catch (error) {
		console.error("❌ Error checking events:", error);
	}
}

async function initializeAgents() {
	const ammAgent = await getAmmAgent();

	const samplingHandler = createSamplingHandler(async (request) => {
		if (!ammAgent.runner || !ammAgent.session) {
			throw new Error("Runner not found");
		}

		const response = await waitForRunAsyncCompletion(
			ammAgent.runner.runAsync({
				userId: "user-1",
				sessionId: ammAgent.session.id,
				newMessage: request.contents[0],
			}),
		);

		return {
			content: {
				role: "model",
				parts: [{ text: response }],
			},
		};
	});

	const nearAgent = await getNearAgent(samplingHandler);

	return { nearAgent, ammAgent };
}

// Helper function to wait for runAsync completion and return final response
async function waitForRunAsyncCompletion(
	asyncGenerator: AsyncGenerator<Event, void, unknown>,
): Promise<string> {
	let finalResponse = "";

	for await (const event of asyncGenerator) {
		if (!event.partial && event.content?.parts?.[0]?.text) {
			finalResponse += event.content.parts[0].text;
		}
	}

	return finalResponse;
}

main().catch(console.error);
