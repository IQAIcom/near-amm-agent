import { z } from "zod";

// String validation schemas
export const StringSchemas = {
	accountId: z
		.string()
		.min(1)
		.max(64)
		.regex(/^[a-z0-9._-]+$/),
	amount: z.string().regex(/^\d+(\.\d+)?$/),
	transactionHash: z.string().regex(/^[A-Za-z0-9]{44}$/),
	tokenSymbol: z.string().min(1).max(10),
	networkId: z.enum(["mainnet", "testnet", "betanet", "localnet"]),
} as const;

// String formatting utilities
export function safeToString(value: unknown): string {
	if (value === null || value === undefined) {
		return "";
	}
	return String(value);
}

export function formatBalance(balance: string, decimals: number): string {
	const num = Number.parseFloat(balance);
	if (Number.isNaN(num)) return "0.000000";
	return (num / 10 ** decimals).toFixed(6);
}

export function formatNEARBalance(balance: string): string {
	return formatBalance(balance, 24);
}

export function formatUSDTBalance(balance: string): string {
	return formatBalance(balance, 6);
}

export function toYoctoNEAR(amount: string): string {
	const num = Number.parseFloat(amount);
	if (Number.isNaN(num)) return "0";
	return (num * 1e24).toString();
}

export function toUSDTUnits(amount: string): string {
	const num = Number.parseFloat(amount);
	if (Number.isNaN(num)) return "0";
	return (num * 1e6).toString();
}

export function truncate(str: string, maxLength: number): string {
	if (str.length <= maxLength) return str;
	return `${str.slice(0, maxLength - 3)}...`;
}

export function formatTransactionHash(hash: string): string {
	if (hash.length <= 10) return hash;
	return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

export function createBalanceDisplay(
	accountId: string,
	balances: Record<string, { token: string; formatted: string }>,
): string {
	const balanceLines = Object.values(balances)
		.map((balance) => `${balance.token}: ${balance.formatted}`)
		.join("\n");

	return `💰 Account: ${accountId}\n\n${balanceLines}`;
}

export function createSwapConfirmationMessage(params: {
	amountIn: string;
	swapType: string;
	minAmountOut: string;
}): string {
	const { amountIn, swapType, minAmountOut } = params;
	const isWrapNearToUsdt = String(swapType) === "wrap_near_to_usdt";
	const tokenIn = isWrapNearToUsdt ? "wNEAR" : "USDT";
	const tokenOut = isWrapNearToUsdt ? "USDT" : "wNEAR";

	return `Are you sure you want to swap ${String(amountIn)} ${tokenIn} for at least ${String(minAmountOut)} ${tokenOut}?`;
}

export function sanitizeInput(input: string): string {
	return input.replace(/[<>]/g, "");
}

export function capitalizeWords(str: string): string {
	return str
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}

// Type-safe string validation
export function isValidAccountId(accountId: string): boolean {
	return StringSchemas.accountId.safeParse(accountId).success;
}

export function isValidAmount(amount: string): boolean {
	return StringSchemas.amount.safeParse(amount).success;
}

export function isValidTransactionHash(hash: string): boolean {
	return StringSchemas.transactionHash.safeParse(hash).success;
}

export function isValidTokenSymbol(symbol: string): boolean {
	return StringSchemas.tokenSymbol.safeParse(symbol).success;
}

export function isValidNetworkId(networkId: string): boolean {
	return StringSchemas.networkId.safeParse(networkId).success;
}

// Constants for common strings
export const StringConstants = {
	EMOJIS: {
		NEAR: "Ⓝ",
		WRAP_NEAR: "wⓃ",
		USDT: "💵",
		SUCCESS: "✅",
		ERROR: "❌",
		WARNING: "⚠️",
		INFO: "ℹ️",
		LOADING: "⏳",
		SWAP: "🔄",
		BALANCE: "💰",
		TRANSACTION: "📄",
		AGENT: "🤖",
	} as const,

	MESSAGES: {
		BALANCE_FETCHING: "Fetching account balances...",
		BALANCE_SUCCESS: "Balances fetched successfully!",
		BALANCE_FAILED: "Failed to fetch balances",
		SWAP_EXECUTING: "Executing swap transaction...",
		SWAP_SUCCESS: "Swap transaction submitted successfully!",
		SWAP_FAILED: "Swap transaction failed",
		AGENT_WAITING: "Waiting for agent to process the swap...",
		AGENT_SUCCESS: "Agent processing complete!",
		AGENT_PROCESSED: "The AMM agent should have processed your swap request!",
		DEMO_SUCCESS: "🎉 Swap demo completed successfully!",
		DEMO_FAILED: "❌ Swap failed. Please check your balances and try again.",
		NO_SWAP_TYPE: "❌ No swap type selected. Exiting.",
		NO_AMOUNT: "❌ No amount entered. Exiting.",
		NO_MIN_AMOUNT: "❌ No minimum amount entered. Exiting.",
		SWAP_CANCELLED: "❌ Swap cancelled.",
	} as const,

	LABELS: {
		CURRENT_BALANCES: "Current Balances",
		UPDATED_BALANCES: "Updated Balances",
		FINAL_BALANCES: "Final balances after swap:",
	} as const,
} as const;
