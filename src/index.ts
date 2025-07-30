import { type BuiltAgent, createSamplingHandler } from "@iqai/adk";
import * as cron from "node-cron";
import { getAmmAgent } from "./agents/amm-agent/agent";
import { getNearAgent } from "./agents/near-agent/agent";
import { startServer } from "./server";

const CONTRACT_ADDRESS = "amm-iqai.near";
const EVENT_TYPE = "run_agent";
const POLLING_INTERVAL = "*/5 * * * *"; // Every 5 minutes

async function main() {
	// Start the health check server (bypass gcp health check)
	startServer();

	// Initialize agents
	const { nearAgent } = await initializeAgents();

	// Setup initial event listener
	await setupEventListener(nearAgent);

	// Start periodic status checking
	startCronJob(nearAgent);

	console.log("🚀 Near AMM Agent is now running!");
}

async function setupEventListener(nearAgent: BuiltAgent) {
	console.log("ℹ️ Setting up event listener...");

	if (!nearAgent.runner || !nearAgent.session) {
		throw new Error("Runner or session not found");
	}

	const output = await nearAgent.runner.ask(
		`With 'watch_near_event' tool, Watch for '${EVENT_TYPE}' events on '${CONTRACT_ADDRESS}' contract. for response call agent_response method and amount_out as response parameter name and poll every 10s`,
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

		const statusOutput = await nearAgent.runner.ask(
			`Check status for '${EVENT_TYPE}' events on '${CONTRACT_ADDRESS}' contract and provide current status. Include statistics!`,
		);

		console.log("📠 Status Update:", statusOutput);
	} catch (error) {
		console.error("❌ Error checking events:", error);
	}
}

async function initializeAgents() {
	const ammAgent = await getAmmAgent();
	const samplingHandler = createSamplingHandler(ammAgent.runner.ask);

	const nearAgent = await getNearAgent(samplingHandler);

	return { nearAgent };
}

main().catch(console.error);
