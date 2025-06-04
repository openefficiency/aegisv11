-- Safely add users without department (doesn't drop existing table)

-- First, ensure the profiles table exists with proper structure
CREATE TABLE IF NOT EXISTS profiles (
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

-- Function to safely insert a user
CREATE OR REPLACE FUNCTION safe_insert_user(
    p_email VARCHAR(255),
    p_first_name VARCHAR(100),
    p_last_name VARCHAR(100),
    p_role VARCHAR(50),
    p_is_active BOOLEAN DEFAULT true
) RETURNS TEXT AS $$
DECLARE
    result_message TEXT;
BEGIN
    -- Try to insert the user
    INSERT INTO profiles (email, first_name, last_name, role, is_active)
    VALUES (p_email, p_first_name, p_last_name, p_role, p_is_active);
    
    result_message := 'Successfully created user: ' || p_email;
    RETURN result_message;
    
EXCEPTION
    WHEN unique_violation THEN
        result_message := 'User already exists: ' || p_email;
        RETURN result_message;
    WHEN OTHERS THEN
        result_message := 'Error creating user ' || p_email || ': ' || SQLERRM;
        RETURN result_message;
END;
$$ LANGUAGE plpgsql;

-- Create demo users using the safe function
SELECT safe_insert_user('admin@aegiswhistle.com', 'System', 'Administrator', 'admin', true);
SELECT safe_insert_user('ethics@aegiswhistle.com', 'Ethics', 'Officer', 'ethics_officer', true);
SELECT safe_insert_user('investigator@aegiswhistle.com', 'Lead', 'Investigator', 'investigator', true);
SELECT safe_insert_user('john.doe@aegiswhistle.com', 'John', 'Doe', 'ethics_officer', true);
SELECT safe_insert_user('jane.smith@aegiswhistle.com', 'Jane', 'Smith', 'investigator', true);
SELECT safe_insert_user('mike.wilson@aegiswhistle.com', 'Mike', 'Wilson', 'investigator', false);
SELECT safe_insert_user('sarah.johnson@aegiswhistle.com', 'Sarah', 'Johnson', 'ethics_officer', true);

-- Display all users
SELECT 
    email, 
    first_name || ' ' || last_name as full_name,
    role, 
    CASE WHEN is_active THEN 'Active' ELSE 'Inactive' END as status,
    COALESCE(department, 'No Department') as department,
    created_at
FROM profiles 
ORDER BY role, first_name;

-- Clean up the function
DROP FUNCTION IF EXISTS safe_insert_user(VARCHAR, VARCHAR, VARCHAR, VARCHAR, BOOLEAN);
