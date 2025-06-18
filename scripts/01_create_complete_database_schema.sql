-- Complete Database Schema for Aegis Whistle Platform
-- Project: vnjfnlnwfhnwzcfkdrsw

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS audit_trails CASCADE;
DROP TABLE IF EXISTS reward_transactions CASCADE;
DROP TABLE IF EXISTS investigator_queries CASCADE;
DROP TABLE IF EXISTS case_updates CASCADE;
DROP TABLE IF EXISTS interviews CASCADE;
DROP TABLE IF EXISTS vapi_reports CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. PROFILES TABLE (Users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'ethics_officer', 'investigator')),
    is_active BOOLEAN DEFAULT true,
    department VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. REPORTS TABLE (Main reports table with all sources)
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id VARCHAR(10) UNIQUE NOT NULL, -- 10-digit alphanumeric key
    case_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) CHECK (category IN ('fraud', 'abuse', 'discrimination', 'harassment', 'safety', 'corruption')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'under_investigation', 'resolved', 'escalated', 'closed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Report Source Classification
    report_source VARCHAR(20) DEFAULT 'ManualReport' CHECK (report_source IN ('VAPIReport', 'MapReport', 'ManualReport')),
    report_type VARCHAR(50) DEFAULT 'written',
    
    -- Location data for map reports
    location VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Contact and anonymity
    is_anonymous BOOLEAN DEFAULT true,
    contact_info TEXT,
    date_occurred DATE,
    
    -- Tracking and security
    secret_code VARCHAR(100) NOT NULL,
    report_id VARCHAR(10) UNIQUE NOT NULL, -- 10-digit alphanumeric
    tracking_code VARCHAR(100),
    
    -- VAPI specific fields
    vapi_report_summary TEXT,
    vapi_session_id VARCHAR(255),
    vapi_transcript TEXT,
    vapi_audio_url TEXT,
    vapi_call_data JSONB,
    
    -- Reward system
    reward_amount DECIMAL(10,2) DEFAULT 0,
    recovery_amount DECIMAL(10,2) DEFAULT 0,
    reward_status VARCHAR(20) DEFAULT 'pending' CHECK (reward_status IN ('pending', 'approved', 'paid')),
    crypto_address VARCHAR(255),
    crypto_currency VARCHAR(20),
    
    -- Case management
    assigned_to UUID REFERENCES profiles(id),
    assigned_by UUID REFERENCES profiles(id),
    resolution_summary TEXT,
    whistleblower_update TEXT,
    
    -- Structured data for AI processing
    structured_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CASES TABLE (Legacy compatibility)
CREATE TABLE cases (
    id VARCHAR(255) PRIMARY KEY,
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
    report_source VARCHAR(20) DEFAULT 'ManualReport',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location VARCHAR(500),
    is_anonymous BOOLEAN DEFAULT true,
    contact_info TEXT,
    date_occurred DATE,
    vapi_call_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. VAPI REPORTS TABLE (Staging for voice reports)
CREATE TABLE vapi_reports (
    id VARCHAR(255) PRIMARY KEY,
    report_id VARCHAR(10) UNIQUE NOT NULL,
    summary TEXT,
    transcript TEXT,
    audio_url TEXT,
    session_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processed')),
    vapi_call_data JSONB,
    processed_to_case_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- 5. CASE UPDATES TABLE
CREATE TABLE case_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    update_type VARCHAR(50) CHECK (update_type IN ('progress', 'status', 'escalated', 'resolved')),
    is_public BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. INTERVIEWS TABLE
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id VARCHAR(255) NOT NULL,
    investigator_id UUID REFERENCES profiles(id),
    interviewee_name VARCHAR(255) NOT NULL,
    interviewee_type VARCHAR(50) CHECK (interviewee_type IN ('witness', 'subject', 'expert')),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. INVESTIGATOR QUERIES TABLE
CREATE TABLE investigator_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id VARCHAR(255) NOT NULL,
    investigator_id UUID REFERENCES profiles(id),
    query_text TEXT NOT NULL,
    response_text TEXT,
    response_audio_url TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'responded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE
);

-- 8. AUDIT TRAILS TABLE
CREATE TABLE audit_trails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) CHECK (entity_type IN ('case', 'reward', 'assignment', 'query', 'report')),
    entity_id VARCHAR(255) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. REWARD TRANSACTIONS TABLE
CREATE TABLE reward_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    crypto_currency VARCHAR(20) NOT NULL,
    crypto_address VARCHAR(255) NOT NULL,
    transaction_hash VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_reports_case_id ON reports(case_id);
CREATE INDEX idx_reports_report_source ON reports(report_source);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_category ON reports(category);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_reports_location ON reports(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_category ON cases(category);
CREATE INDEX idx_cases_created_at ON cases(created_at);
CREATE INDEX idx_cases_report_id ON cases(report_id);

CREATE INDEX idx_vapi_reports_status ON vapi_reports(status);
CREATE INDEX idx_vapi_reports_processed ON vapi_reports(processed_to_case_id);
CREATE INDEX idx_vapi_reports_created_at ON vapi_reports(created_at);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

CREATE INDEX idx_audit_trails_user_id ON audit_trails(user_id);
CREATE INDEX idx_audit_trails_entity_type ON audit_trails(entity_type);
CREATE INDEX idx_audit_trails_timestamp ON audit_trails(timestamp);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMENT ON TABLE reports IS 'Main reports table supporting all report sources (VAPI, Map, Manual)';
COMMENT ON TABLE cases IS 'Legacy cases table for backward compatibility';
COMMENT ON TABLE vapi_reports IS 'Staging table for VAPI voice reports before processing';
COMMENT ON TABLE profiles IS 'User profiles for admin, ethics officers, and investigators';
COMMENT ON TABLE audit_trails IS 'Audit log for all system actions';
COMMENT ON TABLE reward_transactions IS 'Crypto reward transaction records';

SELECT 'Database schema created successfully!' as status;
