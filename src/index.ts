import { type Agent, createSamplingHandler } from "@iqai/adk";
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

async function setupEventListener(nearAgent: Agent) {
	console.log("ℹ️ Setting up event listener...");

	const output = await nearAgent.run({
		messages: [
			{
				role: "user",
				content: `With 'watch_near_event' tool, Watch for '${EVENT_TYPE}' events on '${CONTRACT_ADDRESS}' contract. for response call agent_response method and poll every 10s`,
			},
		],
	});

	console.log("📠 Initial Setup:", output.content);
}

function startCronJob(nearAgent: Agent) {
	console.log("ℹ️ Starting cron job for event monitoring...");

	cron.schedule(POLLING_INTERVAL, () => checkEventStatus(nearAgent));

	console.log("✅ Cron job scheduled to run every 10 seconds");
}

async function checkEventStatus(nearAgent: Agent) {
	try {
		console.log(`🔍 Checking for ${EVENT_TYPE} events...`);

		const statusOutput = await nearAgent.run({
			messages: [
				{
					role: "user",
					content: `Check status for '${EVENT_TYPE}' events on '${CONTRACT_ADDRESS}' contract and provide current status. Include statistics!`,
				},
			],
		});

		console.log("📠 Status Update:", statusOutput.content);
	} catch (error) {
		console.error("❌ Error checking events:", error);
	}
}

async function initializeAgents() {
	const ammAgent = getAmmAgent();

	const samplingHandler = createSamplingHandler((request) =>
		ammAgent.run({
			messages: request.messages,
		}),
	);

	const nearAgent = await getNearAgent(samplingHandler);

	return { nearAgent };
}

main().catch(console.error);
