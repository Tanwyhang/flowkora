-- Create ENUM types for better data integrity
CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'failed');
CREATE TYPE currency_type AS ENUM ('USDC', 'USDT', 'DAI', 'MYRC');
CREATE TYPE api_key_status AS ENUM ('active', 'revoked');

-- Add a trigger to automatically update 'updated_at' columns
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table: merchants
CREATE TABLE merchants (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  payout_wallet_address TEXT CHECK (payout_wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
  webhook_url TEXT CHECK (webhook_url ~ '^https://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:/.*)?$'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER set_merchants_timestamp
BEFORE UPDATE ON merchants
FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();

-- Table: transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  merchant_order_id TEXT NOT NULL,
  amount NUMERIC(18, 6) NOT NULL CHECK (amount > 0),
  currency currency_type NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  customer_email TEXT CHECK (customer_email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
  tx_hash TEXT UNIQUE CHECK (tx_hash ~ '^0x[a-fA-F0-9]{64}$'),
  callback_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Prevent duplicate payment sessions for the same order
  UNIQUE(merchant_id, merchant_order_id)
);
-- Add indexes for performance
CREATE INDEX idx_transactions_merchant_id ON transactions(merchant_id);
CREATE INDEX idx_transactions_merchant_order_id ON transactions(merchant_order_id);
CREATE TRIGGER set_transactions_timestamp
BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();

-- Table: api_keys
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  name TEXT,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  status api_key_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);
CREATE INDEX idx_api_keys_merchant_id ON api_keys(merchant_id);

-- Trigger to create a merchant profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.merchants (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable Row Level Security for all tables
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Merchants can view and manage their own data."
ON merchants FOR ALL
USING (auth.uid() = id);

CREATE POLICY "Merchants can view their own transactions."
ON transactions FOR SELECT
USING (auth.uid() = merchant_id);

CREATE POLICY "Merchants can create transactions for themselves."
ON transactions FOR INSERT
WITH CHECK (auth.uid() = merchant_id);

CREATE POLICY "Merchants can view and manage their own API keys."
ON api_keys FOR ALL
USING (auth.uid() = merchant_id);
