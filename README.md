# 🤖 AMM Near Agent

This repository contains a practical example of AI integration with the NEAR blockchain protocol, specifically an Automated Market Maker (AMM) agent built with the `@iqai/adk` library. The agent listens for blockchain events and performs automated market making calculations.

## ❓ What is the AMM Near Agent?

The AMM Near Agent is a specialized AI agent that facilitates trading between two assets on the NEAR Protocol. It works with the [AMM Near Contract](https://github.com/zavodil/ai-amm) to provide automated price calculations for token swaps using the constant product formula (x * y = k).

### ⚙️ How It Works

1. **Event Listening**: The Near Agent continuously monitors the `amm.iqai.near` contract for `run_agent` events
2. **Event Processing**: When a swap event is detected, the agent processes the transaction details
3. **AMM Calculations**: The AMM Agent calculates optimal output amounts using the constant product formula
4. **Response**: The agent responds with calculated swap amounts back to the contract
5. **Transaction Completion**: The contract finalizes the swap and transfers tokens to the user

## 🏗️ Architecture

The project consists of two main agents:

- **Near Agent** (`src/agents/near-agent.ts`): Handles blockchain event listening using MCP (Model Context Protocol)
- **AMM Agent** (`src/agents/amm-agent.ts`): Performs automated market making calculations using custom tools

### 🛠️ Tools

- **Amount Out Calculator** (`src/tools/amount-out-caluculator.ts`): Calculates swap output amounts using AMM constant product formula

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- NEAR account and access to NEAR testnet/mainnet

### 💾 Installation

```bash
# Clone the repository
git clone https://github.com/IQAIcom/near-amm-agent

# Navigate to the project directory
cd amm-near-agent

# Install dependencies
pnpm install
```

### ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# NEAR Account Configuration
ACCOUNT_ID=your-account.near
ACCOUNT_KEY=your-private-key

# NEAR Network Configuration
NEAR_NETWORK_ID=mainnet  # or testnet
NEAR_NODE_URL=https://rpc.mainnet.near.org  # or https://rpc.testnet.near.org
NEAR_GAS_LIMIT=300000000000000

# Debug Mode
DEBUG=false
```

### ▶️ Running the Agent

```bash
# Start the AMM Near Agent
pnpm dev
```

The agent will start listening for events on the `amm.iqai.near` contract and process swap calculations automatically.

## 🔍 Example Transactions

We've deployed the NEAR contract on mainnet, which you can view at [https://nearblocks.io/address/amm-iqai.near](https://nearblocks.io/address/amm-iqai.near). Here are some example transactions:

- [Creating new pool for USDT and wNEAR](https://nearblocks.io/txns/ADq5gcUy6DKLoFcFgCc9ged9S1eD6KiNhRfYXSHuR1kC)
- [Swap USDT with wNEAR](https://nearblocks.io/txns/Doz8W9sJQ2wgvGeAHwYYmULLsjeiHrvFHXSRhi8K91Rq#execution#5g4KuV8HR6z8DZW8k3gXSJ9Np5JcevsZC84sv1kNGxBd)
- [Agent response to the swap transaction](https://nearblocks.io/txns/CJ7Vb9Pvm7gGjruF9PdS3DB9K5gYFqorqUG3koWgX8ao)
- [FT Transfer](https://nearblocks.io/txns/QXQUMTMKmYH9L55HzWygb9oYnzUyUcpA9jCduvVaxA9#execution#ACuByCKyJ3qhFJCcK7JBv74usyGYAcqb5Skf8pgxiqvp)

## 🔧 Development

### Adding New Tools

1. Create a new tool class extending `BaseTool` in the `src/tools/` directory
2. Implement the required methods: `getDeclaration()` and `runAsync()`
3. Add the tool to your agent in the respective agent file

### Extending Functionality

- **New Agents**: Create additional agents in `src/agents/`
- **Custom Tools**: Add specialized tools for different calculations
- **Event Handlers**: Extend event listening capabilities

## 📚 Additional Resources

- [ADK Library Documentation](https://github.com/IQAICOM/adk-ts)
- [NEAR Protocol Documentation](https://docs.near.org/)
- [AMM Near Contract Repository](https://github.com/zavodil/ai-amm)
- [MCP Near Agent Package](https://www.npmjs.com/package/@iqai/mcp-near-agent)

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.
