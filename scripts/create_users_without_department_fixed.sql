-- Create users/profiles without department field (FIXED VERSION)
-- This script properly handles constraints and user creation

-- Drop existing table if it exists (for clean setup)
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table with proper constraints
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'ethics_officer', 'investigator')),
    is_active BOOLEAN DEFAULT true,
    department VARCHAR(100), -- Optional field
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Insert demo users without department (using INSERT with error handling)
DO $$
BEGIN
    -- Insert admin user
    INSERT INTO profiles (email, first_name, last_name, role, is_active) 
    VALUES ('admin@aegiswhistle.com', 'System', 'Administrator', 'admin', true);
    RAISE NOTICE 'Created admin user';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Admin user already exists, skipping...';
END $$;

DO $$
BEGIN
    -- Insert ethics officer
    INSERT INTO profiles (email, first_name, last_name, role, is_active) 
    VALUES ('ethics@aegiswhistle.com', 'Ethics', 'Officer', 'ethics_officer', true);
    RAISE NOTICE 'Created ethics officer user';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Ethics officer user already exists, skipping...';
END $$;

DO $$
BEGIN
    -- Insert investigator
    INSERT INTO profiles (email, first_name, last_name, role, is_active) 
    VALUES ('investigator@aegiswhistle.com', 'Lead', 'Investigator', 'investigator', true);
    RAISE NOTICE 'Created investigator user';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Investigator user already exists, skipping...';
END $$;

DO $$
BEGIN
    -- Insert additional test users
    INSERT INTO profiles (email, first_name, last_name, role, is_active) 
    VALUES ('john.doe@aegiswhistle.com', 'John', 'Doe', 'ethics_officer', true);
    RAISE NOTICE 'Created John Doe user';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'John Doe user already exists, skipping...';
END $$;

DO $$
BEGIN
    INSERT INTO profiles (email, first_name, last_name, role, is_active) 
    VALUES ('jane.smith@aegiswhistle.com', 'Jane', 'Smith', 'investigator', true);
    RAISE NOTICE 'Created Jane Smith user';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Jane Smith user already exists, skipping...';
END $$;

DO $$
BEGIN
    INSERT INTO profiles (email, first_name, last_name, role, is_active) 
    VALUES ('mike.wilson@aegiswhistle.com', 'Mike', 'Wilson', 'investigator', false);
    RAISE NOTICE 'Created Mike Wilson user (inactive)';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Mike Wilson user already exists, skipping...';
END $$;

DO $$
BEGIN
    INSERT INTO profiles (email, first_name, last_name, role, is_active) 
    VALUES ('sarah.johnson@aegiswhistle.com', 'Sarah', 'Johnson', 'ethics_officer', true);
    RAISE NOTICE 'Created Sarah Johnson user';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Sarah Johnson user already exists, skipping...';
END $$;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Display all created users
SELECT 
    email, 
    first_name, 
    last_name, 
    role, 
    is_active,
    CASE 
        WHEN department IS NULL THEN 'No Department' 
        ELSE department 
    END as department_status,
    created_at
FROM profiles 
ORDER BY role, first_name;

-- Show table structure
\d profiles;
