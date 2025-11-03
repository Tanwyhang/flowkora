# FlowKora: Crypto Payment Gateway for Stablecoins

**IMPORTANT:** This document is the single source of truth for the FlowKora project. Please keep it up-to-date.

## Project Overview
**FlowKora** is a decentralized **payment gateway** for merchants and users to transact with **stablecoins on Arbitrum One**. It provides a simple and secure way to accept crypto payments.

## Core Objectives
- Enable merchants to accept stablecoin payments.
- Allow users to pay from their crypto wallets.
- Provide a developer-friendly SDK/API for integration.
- Use the **Thirdweb SDK** for wallet management and payment processing.
- Ensure a non-custodial architecture for full transparency.

## Thirdweb Docs
When working on Thirdweb related tasks, refer to the following documentation:
- **thirdweb API docs:** `api.llm.txt`
- **thirdweb SDK docs:** `sdk.llm.txt`

## Implementation Plan
The project is divided into five phases:

### Phase 1: Project Setup & Scaffolding
- [x] Initialize Next.js project.
- [x] Setup TailwindCSS and Shadcn UI.
- [x] Integrate Supabase for the database.
- [x] Integrate Thirdweb SDK for blockchain interactions.
- [x] Create the project structure.
- [x] Configure environment variables.

### Phase 2: Merchant Side - Backend & API
- [x] Implement merchant authentication with Supabase Auth. (Google auth)
- [x] Develop database logic with Row Level Security.
- [x] Create API endpoints for:
    - [x] `POST /api/merchant/create-payment-session`
    - [x] `GET /api/merchant/transactions`
    - [x] `POST /api/webhook/payment-status`
    - [x] `GET /api/merchant/api-keys`

### Phase 3: Merchant Side - Frontend Dashboard
- [x] Build authentication pages.
- [x] Create a dashboard to display transactions.
- [x] Develop a settings page for wallet and webhook configuration.
- [x] Implement an API keys management page.

### Phase 4: Client Side - Payment Portal
- [x] Create a dynamic payment page ` /app/pay/[orderId]/page.tsx`.
- [x] Fetch payment details from the backend.
- [x] Integrate the Thirdweb `ConnectButton` component (or similar UI for wallet connection).
- [x] Implement the payment execution flow.
- [x] Handle transaction status and redirects.

### Phase 5: Testing & Deployment
- [ ] Conduct end-to-end testing of the merchant and user flows.
- [ ] Deploy the application to Vercel.
- [ ] Configure production environment variables.

## System Architecture

### Authentication Mechanisms
FlowKora utilizes two distinct authentication mechanisms:
1.  **Supabase Auth (Google Auth):** This is used for **merchant authentication**. Merchants log in using Google authentication, which is handled by Supabase Auth. This authenticates the merchant to access their dashboard and manage their payment sessions.
2.  **Thirdweb In-App Wallet:** This is used for **user wallet connection** to facilitate stablecoin transactions. The Thirdweb In-App Wallet provides its own authentication methods, which can include social logins like Google. If a user chooses to connect their wallet using Google through the Thirdweb In-App Wallet, it's a separate authentication flow managed by Thirdweb for wallet access, distinct from the Supabase merchant authentication.

### Merchant Integration Flow
1. Merchant calls ` /api/merchant/create-payment-session` to get a `payment_url`.
2. The buyer is redirected to the `payment_url`.
3. The buyer connects their wallet and pays with a stablecoin.
4. FlowKora verifies the transaction and sends a webhook to the merchant.

### Payment Flow (User Perspective)
1. The user is redirected to the FlowKora payment page.
2. The user connects their wallet via the Thirdweb In-App Wallet (or other supported EVM wallet).
3. The user confirms the payment.
4. The user is redirected back to the merchant's website.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS + Shadcn UI
- **Backend:** Next.js API Routes
- **Database:** Supabase
- **Blockchain:** Arbitrum One
- **Web3 SDK:** Thirdweb SDK v5 (using `createThirdwebClient`, `inAppWallet` for users, and `privateKeyToAccount` for server-side operations)
- **Deployment:** Vercel

## API Flow Examples

### Create Payment Session
**Request:** `POST /api/merchant/create-payment-session`
```json
{
  "amount": "50",
  "currency": "USDC",
  "orderId": "MERCHANT_ORDER_123",
  "customerEmail": "customer@example.com",
  "callbackUrl": "https://merchant.com/checkout/confirmation"
}
```

**Response:**
```json
{
  "payment_url": "https://flowkora.com/pay/GENERATED_ORDER_ID"
}
```

### Confirm Payment (Webhook)
**FlowKora → Merchant Backend:** `POST https://merchant.com/api/webhook/payment-status`
```json
{
  "orderId": "MERCHANT_ORDER_123",
  "txHash": "0xdef456...",
  "status": "confirmed",
  "amount": "50",
  "stablecoinUsed": "USDC"
}
```

## Future Roadmap
- Escrow contract for service-based transactions.
- Off-ramp integration for Malaysian users.
- Multi-chain support (Base, Optimism, Polygon).