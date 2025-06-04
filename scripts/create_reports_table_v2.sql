-- Create reports table with enhanced structure
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) CHECK (category IN ('fraud', 'abuse', 'discrimination', 'harassment', 'safety', 'corruption')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'under_investigation', 'resolved', 'escalated')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    secret_code VARCHAR(100) NOT NULL,
    report_id VARCHAR(10) UNIQUE NOT NULL,
    tracking_code VARCHAR(100),
    reward_amount DECIMAL(10,2) DEFAULT 0,
    recovery_amount DECIMAL(10,2) DEFAULT 0,
    reward_status VARCHAR(20) DEFAULT 'pending' CHECK (reward_status IN ('pending', 'approved', 'paid')),
    vapi_report_summary TEXT,
    vapi_session_id VARCHAR(255),
    vapi_transcript TEXT,
    vapi_audio_url TEXT,
    structured_data JSONB,
    assigned_to VARCHAR(255),
    assigned_by VARCHAR(255),
    resolution_summary TEXT,
    whistleblower_update TEXT,
    crypto_address VARCHAR(255),
    crypto_currency VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) CHECK (role IN ('admin', 'ethics_officer', 'investigator')),
    is_active BOOLEAN DEFAULT true,
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert demo profiles
INSERT INTO profiles (email, first_name, last_name, role, is_active, department) VALUES
('admin@aegiswhistle.com', 'Admin', 'User', 'admin', true, 'Administration'),
('ethics@aegiswhistle.com', 'Ethics', 'Officer', 'ethics_officer', true, 'Ethics'),
('investigator@aegiswhistle.com', 'Lead', 'Investigator', 'investigator', true, 'Investigations')
ON CONFLICT (email) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
