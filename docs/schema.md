# FlowKora Database Schema

This document provides a detailed overview of the FlowKora database schema, including table structures, column descriptions, custom types, and security policies.

---

## Custom Data Types

To ensure data integrity, we use custom `ENUM` types for specific fields.

- **`transaction_status`**: Represents the lifecycle of a payment.
  - `pending`: The initial state of a transaction.
  - `confirmed`: The on-chain transaction was successful.
  - `failed`: The transaction failed.

- **`currency_type`**: Defines the supported stablecoins.
  - `USDC`
  - `USDT`
  - `DAI`

- **`api_key_status`**: Manages the state of a merchant's API key.
  - `active`: The key is valid and can be used.
  - `revoked`: The key has been disabled and can no longer be used.

---

## Tables

### 1. `merchants`

Stores profile information for merchants, extending the `auth.users` table.

| Column                | Type        | Constraints                                     | Description                                                                 |
| --------------------- | ----------- | ----------------------------------------------- | --------------------------------------------------------------------------- |
| `id`                  | `UUID`      | **Primary Key**, Foreign Key to `auth.users.id` | Links directly to the Supabase authentication user.                         |
| `payout_wallet_address` | `TEXT`      | CHECK (valid Ethereum address format)           | The merchant\'s on-chain wallet address for receiving payments.              |
| `is_payout_wallet_verified` | `BOOLEAN`   | `DEFAULT FALSE`                                 | Indicates if the payout wallet address has been cryptographically verified. |
| `webhook_url`         | `TEXT`      | CHECK (valid HTTPS URL format)                  | The secure endpoint for sending payment status webhooks to the merchant.    |
| `created_at`          | `TIMESTAMPTZ` | `DEFAULT NOW()`                                 | Timestamp of when the merchant record was created.                          |
| `updated_at`          | `TIMESTAMPTZ` | `DEFAULT NOW()`                                 | Timestamp of the last update (automatically managed by a trigger).          |

### 2. `transactions`

Logs every payment session initiated on the platform.

| Column              | Type                 | Constraints                               | Description                                                                 |
| ------------------- | -------------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| `id`                | `UUID`               | **Primary Key**, `DEFAULT gen_random_uuid()`  | Unique identifier for the transaction.                                      |
| `merchant_id`       | `UUID`               | **Not Null**, Foreign Key to `merchants.id` | Links the transaction to a specific merchant.                               |
| `merchant_order_id` | `TEXT`               | **Not Null**, Unique with `merchant_id`     | The unique order ID from the merchant's system. Ensures idempotency.        |
| `amount`            | `NUMERIC(18, 6)`     | **Not Null**, `CHECK (amount > 0)`        | The transaction amount, stored with high precision.                         |
| `currency`          | `currency_type`      | **Not Null**                              | The stablecoin used for the transaction.                                    |
| `status`            | `transaction_status` | **Not Null**, `DEFAULT 'pending'`         | The current status of the transaction.                                      |
| `customer_email`    | `TEXT`               | CHECK (valid email format)                | The email address of the paying customer.                                   |
| `tx_hash`           | `TEXT`               | `UNIQUE`, CHECK (valid tx hash format)    | The on-chain transaction hash, unique for every confirmed payment.          |
| `callback_url`      | `TEXT`               | **Not Null**                              | The URL to redirect the user to after payment completion.                   |
| `created_at`        | `TIMESTAMPTZ`        | `DEFAULT NOW()`                           | Timestamp of when the transaction was created.                              |
| `updated_at`        | `TIMESTAMPTZ`        | `DEFAULT NOW()`                           | Timestamp of the last update (automatically managed by a trigger).          |

### 3. `api_keys`

Manages API keys for programmatic access by merchants.

| Column         | Type             | Constraints                               | Description                                                                 |
| -------------- | ---------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| `id`           | `UUID`           | **Primary Key**, `DEFAULT gen_random_uuid()`  | Unique identifier for the API key record.                                   |
| `merchant_id`  | `UUID`           | **Not Null**, Foreign Key to `merchants.id` | Links the API key to a specific merchant.                                   |
| `name`         | `TEXT`           |                                           | An optional, user-defined name for the key (e.g., "Staging Server").       |
| `key_prefix`   | `TEXT`           | **Not Null**                              | A short, non-secret prefix to help identify the key (e.g., `fk_live_`).     |
| `key_hash`     | `TEXT`           | **Not Null**, `UNIQUE`                    | A secure hash of the API key. The actual key is never stored.               |
| `status`       | `api_key_status` | **Not Null**, `DEFAULT 'active'`          | The current status of the key (active or revoked).                          |
| `created_at`   | `TIMESTAMPTZ`    | `DEFAULT NOW()`                           | Timestamp of when the key was created.                                      |
| `last_used_at` | `TIMESTAMPTZ`    |                                           | Timestamp of the last time the key was used.                                |
| `expires_at`   | `TIMESTAMPTZ`    |                                           | An optional expiration date for the key to enforce rotation.                |

---

## Automation and Triggers

- **`handle_new_user()`**: This trigger runs after a new user signs up via Supabase Auth. It automatically creates a corresponding record in the `public.merchants` table, linking the auth user to a merchant profile.

- **`trigger_set_timestamp()`**: This trigger automatically updates the `updated_at` column on the `merchants` and `transactions` tables whenever a row is modified.

---

## Row Level Security (RLS)

RLS is enabled on all tables to ensure that merchants can only access their own data.

- **`merchants`**: A user can only view, update, or delete their own merchant record.
- **`transactions`**: A user can only view and create transactions that are linked to their `merchant_id`.
- **`api_keys`**: A user can only view, create, update, or delete API keys that are linked to their `merchant_id`.
