import {
	confirm,
	intro,
	log,
	note,
	outro,
	select,
	spinner,
	text,
} from "@clack/prompts";
import { config } from "dotenv";
import { Account, KeyPairSigner } from "near-api-js";
import { JsonRpcProvider } from "near-api-js/lib/providers";
import type { KeyPairString } from "near-api-js/lib/utils";
import { env } from "./env";

config();

// Contract addresses
const AMM_CONTRACT = "amm.iqai.near";
const WRAP_NEAR_CONTRACT = "wrap.near";
const USDT_CONTRACT = "usdt.tether-token.near";

interface TokenBalance {
	token: string;
	balance: string;
	formatted: string;
}

interface SwapParams {
	tokenIn: string;
	tokenOut: string;
	amountIn: string;
	minAmountOut: string;
}

class NearSwapCLI {
	private account: Account;
	private userAccountId: string;
	private userAccountKey: KeyPairString;

	constructor() {
		if (!env.USER_ACCOUNT_ID || !env.USER_ACCOUNT_KEY) {
			throw Error("User account id or account key not set");
		}
		this.userAccountId = env.USER_ACCOUNT_ID;
		this.userAccountKey = env.USER_ACCOUNT_KEY;

		const signer = KeyPairSigner.fromSecretKey(this.userAccountKey);
		const provider = new JsonRpcProvider({
			url: env.NEAR_NODE_URL,
		});
		this.account = new Account(this.userAccountId, provider, signer);
	}

	async getTokenBalance(
		accountId: string,
		tokenContract: string,
	): Promise<TokenBalance> {
		try {
			const result = await this.account.callFunction({
				contractId: tokenContract,
				methodName: "ft_balance_of",
				args: { account_id: accountId },
			});

			const metadata = (await this.account.callFunction({
				contractId: tokenContract,
				methodName: "ft_metadata",
				args: {},
			})) as { decimals: number; symbol: string };

			const balance = result as string;
			const decimals = metadata.decimals;
			const symbol = metadata.symbol;

			const formatted = (Number.parseInt(balance) / 10 ** decimals).toFixed(6);

			return {
				token: symbol,
				balance,
				formatted,
			};
		} catch (error) {
			return {
				token: "Unknown",
				balance: "0",
				formatted: "0.000000",
			};
		}
	}

	async getNEARBalance(): Promise<TokenBalance> {
		try {
			const balance = await this.account.getBalance();
			const formatted = (Number.parseInt(balance.toString()) / 1e24).toFixed(6);

			return {
				token: "NEAR",
				balance: balance.toString(),
				formatted,
			};
		} catch (error) {
			return {
				token: "NEAR",
				balance: "0",
				formatted: "0.000000",
			};
		}
	}

	async displayBalances() {
		const s = spinner();
		s.start("Fetching account balances...");

		try {
			const nearBalance = await this.getNEARBalance();
			const wrapNearBalance = await this.getTokenBalance(
				this.userAccountId,
				WRAP_NEAR_CONTRACT,
			);
			const usdtBalance = await this.getTokenBalance(
				this.userAccountId,
				USDT_CONTRACT,
			);

			s.stop("Balances fetched successfully!");

			note(
				`💰 Account: ${this.userAccountId}\n\n` +
					`${nearBalance.token}: ${nearBalance.formatted}\n` +
					`${wrapNearBalance.token}: ${wrapNearBalance.formatted}\n` +
					`${usdtBalance.token}: ${usdtBalance.formatted}`,
				"Current Balances",
			);

			return { nearBalance, wrapNearBalance, usdtBalance };
		} catch (error) {
			s.stop("Failed to fetch balances");
			log.error(`Error fetching balances: ${error}`);
			return null;
		}
	}

	async executeSwap(params: SwapParams) {
		const s = spinner();
		s.start("Executing swap transaction...");

		try {
			// Create the swap message
			const swapMsg = {
				Execute: {
					actions: [
						{
							Swap: {
								token_out: params.tokenOut,
								min_amount_out: params.minAmountOut,
							},
						},
					],
				},
			};

			// Execute ft_transfer_call to the AMM contract
			const result = await this.account.callFunction({
				contractId: params.tokenIn,
				methodName: "ft_transfer_call",
				args: {
					receiver_id: AMM_CONTRACT,
					amount: params.amountIn,
					msg: JSON.stringify(swapMsg),
				},
				gas: BigInt(env.NEAR_GAS_LIMIT),
				deposit: BigInt("1"),
			});

			s.stop("Swap transaction submitted successfully!");
			log.success(`Transaction hash: ${result.toString()}`);
			return result;
		} catch (error) {
			s.stop("Swap transaction failed");
			log.error(`Error executing swap: ${error}`);
			throw error;
		}
	}

	async waitForAgentResponse() {
		const s = spinner();
		s.start("Waiting for agent to process the swap...");

		// In a real implementation, you would poll for the transaction status
		// For demo purposes, we'll just wait a bit
		await new Promise((resolve) => setTimeout(resolve, 3000));

		s.stop("Agent processing complete!");
		log.success("The AMM agent should have processed your swap request!");
	}
}

async function main() {
	intro("🔄 NEAR AMM Swap Demo");

	const cli = new NearSwapCLI();

	// Display initial balances
	const initialBalances = await cli.displayBalances();
	if (!initialBalances) {
		outro("❌ Failed to fetch balances. Exiting.");
		process.exit(1);
	}

	// Get swap parameters from user
	const swapType = await select({
		message: "What type of swap would you like to perform?",
		options: [
			{ value: "wrap_near_to_usdt", label: "wNEAR → USDT" },
			{ value: "usdt_to_wrap_near", label: "USDT → wNEAR" },
		],
	});

	if (!swapType) {
		outro("❌ No swap type selected. Exiting.");
		process.exit(1);
	}

	const amountIn = await text({
		message: "Enter amount to swap (e.g., 0.1):",
		placeholder: "0.1",
		validate: (value) => {
			const num = Number.parseFloat(value);
			if (Number.isNaN(num) || num <= 0) {
				return "Please enter a valid positive number";
			}
			return undefined;
		},
	});

	if (!amountIn) {
		outro("❌ No amount entered. Exiting.");
		process.exit(1);
	}

	const minAmountOut = await text({
		message: "Enter minimum amount out (e.g., 0.05):",
		placeholder: "0.05",
		validate: (value) => {
			const num = Number.parseFloat(value);
			if (Number.isNaN(num) || num < 0) {
				return "Please enter a valid non-negative number";
			}
			return undefined;
		},
	});

	if (!minAmountOut) {
		outro("❌ No minimum amount entered. Exiting.");
		process.exit(1);
	}

	// Confirm the swap
	const confirmed = await confirm({
		message: `Are you sure you want to swap ${String(amountIn)} ${String(swapType) === "wrap_near_to_usdt" ? "wNEAR" : "USDT"} for at least ${String(minAmountOut)} ${String(swapType) === "wrap_near_to_usdt" ? "USDT" : "wNEAR"}?`,
	});

	if (!confirmed) {
		outro("❌ Swap cancelled.");
		process.exit(0);
	}

	// Prepare swap parameters
	const swapParams: SwapParams = {
		tokenIn:
			swapType === "wrap_near_to_usdt" ? WRAP_NEAR_CONTRACT : USDT_CONTRACT,
		tokenOut:
			swapType === "wrap_near_to_usdt" ? USDT_CONTRACT : WRAP_NEAR_CONTRACT,
		amountIn: (Number.parseFloat(String(amountIn)) * 1e24).toString(), // Convert to yoctoNEAR
		minAmountOut: (Number.parseFloat(String(minAmountOut)) * 1e6).toString(), // Convert to USDT decimals
	};

	// Execute the swap
	try {
		await cli.executeSwap(swapParams);
		await cli.waitForAgentResponse();

		// Display final balances
		note("Final balances after swap:", "Updated Balances");
		await cli.displayBalances();

		outro("🎉 Swap demo completed successfully!");
	} catch (error) {
		log.error(`Swap failed: ${error}`);
		outro("❌ Swap failed. Please check your balances and try again.");
		process.exit(1);
	}
}

main().catch((error) => {
	log.error(`Unexpected error: ${error}`);
	process.exit(1);
});
