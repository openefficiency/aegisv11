-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'investigator' CHECK (role IN ('admin', 'ethics_officer', 'investigator')),
    is_active BOOLEAN DEFAULT true,
    department VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create main reports table with 10-digit keys
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id VARCHAR(10) UNIQUE NOT NULL, -- 10-digit alphanumeric key
    case_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'other' CHECK (category IN ('fraud', 'harassment', 'safety', 'discrimination', 'corruption', 'other')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'under_investigation', 'resolved', 'escalated', 'closed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    report_source VARCHAR(20) DEFAULT 'ManualReport' CHECK (report_source IN ('VAPIReport', 'MapReport', 'ManualReport')),
    report_type VARCHAR(50),
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_anonymous BOOLEAN DEFAULT true,
    contact_info TEXT,
    date_occurred DATE,
    secret_code VARCHAR(20) UNIQUE NOT NULL,
    report_id VARCHAR(10) NOT NULL, -- 10-digit alphanumeric
    tracking_code VARCHAR(50),
    vapi_report_summary TEXT,
    vapi_session_id VARCHAR(100),
    vapi_transcript TEXT,
    vapi_audio_url TEXT,
    vapi_call_data JSONB,
    reward_amount DECIMAL(10, 2) DEFAULT 0,
    recovery_amount DECIMAL(10, 2) DEFAULT 0,
    reward_status VARCHAR(20) DEFAULT 'pending' CHECK (reward_status IN ('pending', 'approved', 'paid')),
    crypto_address VARCHAR(255),
    crypto_currency VARCHAR(20),
    assigned_to UUID REFERENCES profiles(id),
    assigned_by UUID REFERENCES profiles(id),
    resolution_summary TEXT,
    whistleblower_update TEXT,
    structured_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create VAPI reports table
CREATE TABLE IF NOT EXISTS vapi_reports (
    id VARCHAR(100) PRIMARY KEY,
    report_id VARCHAR(10) NOT NULL,
    summary TEXT,
    transcript TEXT,
    audio_url TEXT,
    session_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processed')),
    vapi_call_data JSONB,
    processed_to_case_id VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Create case updates table
CREATE TABLE IF NOT EXISTS case_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    update_type VARCHAR(20) DEFAULT 'progress' CHECK (update_type IN ('progress', 'status', 'escalated', 'resolved')),
    is_public BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investigator queries table
CREATE TABLE IF NOT EXISTS investigator_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id VARCHAR(10) NOT NULL,
    investigator_id UUID REFERENCES profiles(id),
    query_text TEXT NOT NULL,
    response_text TEXT,
    response_audio_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'responded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE
);

-- Create reward transactions table
CREATE TABLE IF NOT EXISTS reward_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id VARCHAR(10) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    crypto_currency VARCHAR(20) NOT NULL,
    crypto_address VARCHAR(255) NOT NULL,
    transaction_hash VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create audit trail table
CREATE TABLE IF NOT EXISTS audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id VARCHAR(10) NOT NULL,
    investigator_id UUID REFERENCES profiles(id),
    interviewee_name VARCHAR(255) NOT NULL,
    interviewee_type VARCHAR(20) CHECK (interviewee_type IN ('witness', 'subject', 'expert')),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_case_id ON reports(case_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_source ON reports(report_source);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_vapi_reports_report_id ON vapi_reports(report_id);
CREATE INDEX IF NOT EXISTS idx_case_updates_case_id ON case_updates(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user_id ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_timestamp ON audit_trail(timestamp);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions (adjust as needed)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
