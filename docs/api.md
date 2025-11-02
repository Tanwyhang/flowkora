# FlowKora API Documentation

This document provides a detailed overview of the FlowKora API endpoints, including request/response formats and authentication requirements.

---

## 1. Create Payment Session

- **Endpoint:** `POST /api/merchant/create-payment-session`
- **Description:** Creates a new payment session and generates a unique URL for the user to complete the payment.
- **Authentication:** Requires an authenticated merchant session (user must be logged in).

### Request Body

```json
{
  "amount": 50.00,
  "currency": "USDC",
  "orderId": "MERCHANT_ORDER_123",
  "customerEmail": "customer@example.com",
  "callbackUrl": "https://merchant.com/checkout/confirmation"
}
```

| Field           | Type      | Required | Description                                                                 |
| --------------- | --------- | -------- | --------------------------------------------------------------------------- |
| `amount`        | `Number`  | Yes      | The payment amount. Must be a positive number.                              |
| `currency`      | `String`  | Yes      | The stablecoin to be used. Must be one of `USDC`, `USDT`, or `DAI`.          |
| `orderId`       | `String`  | Yes      | A unique identifier for the order from the merchant's system.               |
| `customerEmail` | `String`  | No       | The email address of the customer.                                          |
| `callbackUrl`   | `String`  | Yes      | A valid URL to redirect the user to after a successful payment.             |

### Responses

- **`200 OK`** (Success)
  ```json
  {
    "payment_url": "https://flowkora.com/pay/a1b2c3d4-e5f6-7890-1234-567890abcdef"
  }
  ```

- **`400 Bad Request`**: The request body is missing required fields or contains invalid data.
- **`401 Unauthorized`**: The user is not authenticated.
- **`409 Conflict`**: A payment session with the same `orderId` already exists for this merchant.
- **`500 Internal Server Error`**: An unexpected error occurred.

---

## 2. Get Merchant Transactions

- **Endpoint:** `GET /api/merchant/transactions`
- **Description:** Retrieves a list of all transactions associated with the authenticated merchant.
- **Authentication:** Requires an authenticated merchant session.

### Request Body

None.

### Responses

- **`200 OK`** (Success)
  ```json
  [
    {
      "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "merchant_id": "f0e9d8c7-b6a5-4321-fedc-ba9876543210",
      "merchant_order_id": "MERCHANT_ORDER_123",
      "amount": "50.00",
      "currency": "USDC",
      "status": "confirmed",
      "customer_email": "customer@example.com",
      "tx_hash": "0x123...def",
      "callback_url": "https://merchant.com/checkout/confirmation",
      "created_at": "2025-11-02T06:20:00.123Z",
      "updated_at": "2025-11-02T06:21:30.456Z"
    }
  ]
  ```

- **`401 Unauthorized`**: The user is not authenticated.
- **`500 Internal Server Error`**: An unexpected error occurred.

---

## 3. Update Payment Status (Webhook)

- **Endpoint:** `POST /api/webhook/payment-status`
- **Description:** A public webhook endpoint to receive status updates about a transaction from a payment processor.
- **Authentication:** None. This is a public endpoint. **In production, it must be secured by verifying a signature in the request header.**

### Request Body

```json
{
  "orderId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "txHash": "0x123...def",
  "status": "confirmed"
}
```

| Field     | Type     | Required | Description                                                                 |
| --------- | -------- | -------- | --------------------------------------------------------------------------- |
| `orderId` | `String` | Yes      | The unique ID of the transaction (`transactions.id`).                       |
| `txHash`  | `String` | Yes      | The on-chain transaction hash.                                              |
| `status`  | `String` | Yes      | The new status of the transaction. Must be `confirmed` or `failed`.         |

### Responses

- **`200 OK`** (Success)
  ```json
  {
    "message": "Webhook received and transaction updated successfully."
  }
  ```

- **`400 Bad Request`**: The request body is invalid.
- **`404 Not Found`**: The `orderId` does not correspond to any existing transaction.
- **`500 Internal Server Error`**: An unexpected error occurred.

---

## 4. Get Merchant Profile

- **Endpoint:** `GET /api/merchant/profile`
- **Description:** Retrieves the authenticated merchant's profile information, including payout wallet and webhook URL.
- **Authentication:** Requires an authenticated merchant session.

### Request Body

None.

### Responses

- **`200 OK`** (Success)
  ```json
  {
    "payout_wallet_address": "0x742d35Cc6634C0532925a3b8D43C67B8c8B3E9C6",
    "webhook_url": "https://merchant.com/webhook",
    "is_payout_wallet_verified": true
  }
  ```

- **`401 Unauthorized`**: The user is not authenticated.
- **`500 Internal Server Error`**: An unexpected error occurred.

---

## 5. Update Merchant Profile

- **Endpoint:** `PUT /api/merchant/profile`
- **Description:** Updates the authenticated merchant's profile information.
- **Authentication:** Requires an authenticated merchant session.

### Request Body

```json
{
  "payout_wallet_address": "0x742d35Cc6634C0532925a3b8D43C67B8c8B3E9C6",
  "webhook_url": "https://merchant.com/new-webhook"
}
```

| Field                   | Type     | Required | Description                                                                 |
| ----------------------- | -------- | -------- | --------------------------------------------------------------------------- |
| `payout_wallet_address` | `String` | No       | The merchant's on-chain wallet address for receiving payments.              |
| `webhook_url`           | `String` | No       | The secure endpoint for sending payment status webhooks to the merchant.    |

### Responses

- **`200 OK`** (Success)
  ```json
  {
    "message": "Profile updated successfully."
  }
  ```

- **`400 Bad Request`**: Invalid input format (e.g., invalid wallet address or URL).
- **`401 Unauthorized`**: The user is not authenticated.
- **`500 Internal Server Error`**: An unexpected error occurred.

---

## 6. Verify Payout Wallet Ownership

- **Endpoint:** `POST /api/merchant/verify-payout-wallet`
- **Description:** Verifies ownership of a merchant's payout wallet address by checking a signed message.
- **Authentication:** Requires an authenticated merchant session.

### Request Body

```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b8D43C67B8c8B3E9C6",
  "signedMessage": "0x...",
  "originalMessage": "Verify ownership of this address for FlowKora"
}
```

| Field             | Type     | Required | Description                                                                 |
| ----------------- | -------- | -------- | --------------------------------------------------------------------------- |
| `walletAddress`   | `String` | Yes      | The wallet address to be verified.                                          |
| `signedMessage`   | `String` | Yes      | The cryptographic signature generated by the wallet.                        |
| `originalMessage` | `String` | Yes      | The exact message string that was signed by the wallet.                     |

### Responses

- **`200 OK`** (Success)
  ```json
  {
    "message": "Wallet successfully verified."
  }
  ```

- **`400 Bad Request`**: Invalid input, invalid signature, or signature does not match address.
- **`401 Unauthorized`**: The user is not authenticated.
- **`500 Internal Server Error`**: An unexpected error occurred.

---

## 7. Get API Keys

- **Endpoint:** `GET /api/merchant/api-keys`
- **Description:** Retrieves a list of all API keys associated with the authenticated merchant. The sensitive key hash is never returned.
- **Authentication:** Requires an authenticated merchant session.

### Request Body

None.

### Responses

- **`200 OK`** (Success)
  ```json
  [
    {
      "id": "f1e2d3c4-b5a6-7890-1234-567890abcdef",
      "name": "Production Key",
      "key_prefix": "fk_live_",
      "status": "active",
      "created_at": "2025-11-01T10:00:00.000Z",
      "last_used_at": "2025-11-02T05:30:00.000Z",
      "expires_at": null
    }
  ]
  ```

- **`401 Unauthorized`**: The user is not authenticated.
- **`500 Internal Server Error`**: An unexpected error occurred.

---

## 8. Create API Key

- **Endpoint:** `POST /api/merchant/api-keys`
- **Description:** Generates and returns a new API key for the authenticated merchant. **The full API key is returned only once upon creation.**
- **Authentication:** Requires an authenticated merchant session.

### Request Body

```json
{
  "name": "My New API Key (Optional)"
}
```

| Field  | Type     | Required | Description                                                                 |
| ------ | -------- | -------- | --------------------------------------------------------------------------- |
| `name` | `String` | No       | An optional, user-defined name for the API key.                             |

### Responses

- **`200 OK`** (Success)
  ```json
  {
    "id": "g1h2i3j4-k5l6-7890-1234-567890abcdef",
    "name": "My New API Key",
    "key_prefix": "fk_live_",
    "created_at": "2025-11-02T08:00:00.000Z",
    "fullApiKey": "fk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
  }
  ```

- **`400 Bad Request`**: Invalid input.
- **`401 Unauthorized`**: The user is not authenticated.
- **`500 Internal Server Error`**: An unexpected error occurred.

---

## 9. Revoke API Key

- **Endpoint:** `DELETE /api/merchant/api-keys/[id]`
- **Description:** Revokes an existing API key by setting its status to `revoked`. The key is not deleted from the database for auditing purposes.
- **Authentication:** Requires an authenticated merchant session.

### Request Body

None.

### Responses

- **`200 OK`** (Success)
  ```json
  {
    "message": "API key revoked successfully."
  }
  ```

- **`401 Unauthorized`**: The user is not authenticated.
- **`404 Not Found`**: The API key with the given ID does not exist or does not belong to the authenticated merchant.
- **`500 Internal Server Error`**: An unexpected error occurred.