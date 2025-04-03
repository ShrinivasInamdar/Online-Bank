/*
  # Initial Banking System Schema

  1. New Tables
    - accounts
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - balance (numeric)
      - account_number (text, unique)
      - created_at (timestamp)
      
    - transactions
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - account_id (uuid, references accounts)
      - amount (numeric)
      - type (text)
      - description (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create accounts table
CREATE TABLE accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    balance numeric NOT NULL DEFAULT 0 CHECK (balance >= 0),
    account_number text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- Create transactions table
CREATE TABLE transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    account_id uuid REFERENCES accounts NOT NULL,
    amount numeric NOT NULL,
    type text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer')),
    description text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for accounts
CREATE POLICY "Users can view their own accounts"
    ON accounts
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
    ON accounts
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policies for transactions
CREATE POLICY "Users can view their own transactions"
    ON transactions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
    ON transactions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create function to generate account number
CREATE OR REPLACE FUNCTION generate_account_number()
RETURNS text AS $$
DECLARE
    new_number text;
    done bool;
BEGIN
    done := false;
    WHILE NOT done LOOP
        new_number := LPAD(FLOOR(RANDOM() * 1000000000)::text, 9, '0');
        done := NOT EXISTS (SELECT 1 FROM accounts WHERE account_number = new_number);
    END LOOP;
    RETURN new_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically generate account number
CREATE OR REPLACE FUNCTION set_account_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.account_number IS NULL THEN
        NEW.account_number := generate_account_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER account_number_trigger
    BEFORE INSERT ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION set_account_number();