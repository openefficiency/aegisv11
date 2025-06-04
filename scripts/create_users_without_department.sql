-- Create users/profiles without department field
-- This script creates the basic user profiles needed for the demo

-- First, ensure the profiles table exists
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'ethics_officer', 'investigator')),
    is_active BOOLEAN DEFAULT true,
    department VARCHAR(100), -- Optional field
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert demo users without department
INSERT INTO profiles (email, first_name, last_name, role, is_active) VALUES
    ('admin@aegiswhistle.com', 'System', 'Administrator', 'admin', true),
    ('ethics@aegiswhistle.com', 'Ethics', 'Officer', 'ethics_officer', true),
    ('investigator@aegiswhistle.com', 'Lead', 'Investigator', 'investigator', true)
ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- Add a few more sample users for testing
INSERT INTO profiles (email, first_name, last_name, role, is_active) VALUES
    ('john.doe@aegiswhistle.com', 'John', 'Doe', 'ethics_officer', true),
    ('jane.smith@aegiswhistle.com', 'Jane', 'Smith', 'investigator', true),
    ('mike.wilson@aegiswhistle.com', 'Mike', 'Wilson', 'investigator', false),
    ('sarah.johnson@aegiswhistle.com', 'Sarah', 'Johnson', 'ethics_officer', true)
ON CONFLICT (email) DO NOTHING;

-- Verify the users were created
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
