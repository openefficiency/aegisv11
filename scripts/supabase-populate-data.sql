-- Populate Sample Data for Aegis Whistle Platform in Supabase
-- Run this script AFTER running supabase-complete-setup.sql

-- Function to generate random 10-digit alphanumeric keys
CREATE OR REPLACE FUNCTION generate_10_digit_key() RETURNS VARCHAR(10) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result VARCHAR(10) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..10 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate random secret codes
CREATE OR REPLACE FUNCTION generate_secret_code() RETURNS VARCHAR(12) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result VARCHAR(12) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..12 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Clear existing data
TRUNCATE TABLE public.audit_trails, public.reward_transactions, public.investigator_queries, public.case_updates, public.interviews, public.vapi_reports, public.cases, public.reports, public.profiles RESTART IDENTITY CASCADE;

-- 1. INSERT PROFILES (Users)
INSERT INTO public.profiles (id, email, first_name, last_name, role, is_active, department, phone) VALUES
-- Admin Users
(uuid_generate_v4(), 'admin@aegiswhistle.com', 'Sarah', 'Johnson', 'admin', true, 'Executive', '+1-555-0101'),
(uuid_generate_v4(), 'admin2@aegiswhistle.com', 'Michael', 'Chen', 'admin', true, 'IT Security', '+1-555-0102'),

-- Ethics Officers
(uuid_generate_v4(), 'ethics@aegiswhistle.com', 'Jennifer', 'Williams', 'ethics_officer', true, 'Ethics & Compliance', '+1-555-0201'),
(uuid_generate_v4(), 'ethics2@aegiswhistle.com', 'David', 'Rodriguez', 'ethics_officer', true, 'Ethics & Compliance', '+1-555-0202'),
(uuid_generate_v4(), 'ethics3@aegiswhistle.com', 'Lisa', 'Thompson', 'ethics_officer', true, 'Ethics & Compliance', '+1-555-0203'),

-- Investigators
(uuid_generate_v4(), 'investigator@aegiswhistle.com', 'John', 'Doe', 'investigator', true, 'Internal Affairs', '+1-555-0301'),
(uuid_generate_v4(), 'investigator2@aegiswhistle.com', 'Jane', 'Smith', 'investigator', true, 'Internal Affairs', '+1-555-0302'),
(uuid_generate_v4(), 'investigator3@aegiswhistle.com', 'Robert', 'Brown', 'investigator', true, 'Security', '+1-555-0303'),
(uuid_generate_v4(), 'investigator4@aegiswhistle.com', 'Emily', 'Davis', 'investigator', true, 'HR Investigation', '+1-555-0304'),
(uuid_generate_v4(), 'investigator5@aegiswhistle.com', 'Mark', 'Wilson', 'investigator', true, 'Financial Crimes', '+1-555-0305');

-- Get user IDs for foreign key references
DO $$
DECLARE
    admin_id UUID;
    ethics_id UUID;
    investigator_id UUID;
    case_counter INTEGER := 1;
    report_counter INTEGER := 1;
BEGIN
    -- Get sample user IDs
    SELECT id INTO admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
    SELECT id INTO ethics_id FROM public.profiles WHERE role = 'ethics_officer' LIMIT 1;
    SELECT id INTO investigator_id FROM public.profiles WHERE role = 'investigator' LIMIT 1;

    -- 2. INSERT REPORTS (Main reports table)
    FOR i IN 1..25 LOOP
        INSERT INTO public.reports (
            case_id, case_number, title, description, category, status, priority,
            report_source, location, latitude, longitude, is_anonymous, contact_info,
            date_occurred, secret_code, report_id, tracking_code, reward_amount,
            reward_status, assigned_to, assigned_by, crypto_currency,
            created_at, updated_at
        ) VALUES (
            generate_10_digit_key(),
            'WB-2025-' || LPAD(i::TEXT, 4, '0'),
            CASE (i % 8)
                WHEN 0 THEN 'Financial Irregularities in Accounting Department'
                WHEN 1 THEN 'Workplace Harassment by Senior Manager'
                WHEN 2 THEN 'Safety Violations in Manufacturing Plant'
                WHEN 3 THEN 'Discrimination in Hiring Process'
                WHEN 4 THEN 'Corruption in Procurement Department'
                WHEN 5 THEN 'Fraudulent Expense Claims'
                WHEN 6 THEN 'Unsafe Working Conditions Reported'
                ELSE 'Data Privacy Breach Incident'
            END,
            CASE (i % 8)
                WHEN 0 THEN 'Multiple instances of financial irregularities have been observed in the accounting department, including unauthorized transactions and missing documentation.'
                WHEN 1 THEN 'A senior manager has been engaging in inappropriate behavior towards junior staff members, creating a hostile work environment.'
                WHEN 2 THEN 'Several safety protocols are being ignored in the manufacturing plant, putting workers at risk of injury.'
                WHEN 3 THEN 'There appears to be systematic discrimination against certain groups during the hiring process.'
                WHEN 4 THEN 'Evidence suggests that procurement decisions are being influenced by personal relationships rather than merit.'
                WHEN 5 THEN 'An employee has been submitting fraudulent expense claims for personal expenses.'
                WHEN 6 THEN 'Workers are being exposed to hazardous conditions without proper safety equipment.'
                ELSE 'Sensitive customer data may have been accessed by unauthorized personnel.'
            END,
            CASE (i % 6)
                WHEN 0 THEN 'fraud'
                WHEN 1 THEN 'harassment'
                WHEN 2 THEN 'safety'
                WHEN 3 THEN 'discrimination'
                WHEN 4 THEN 'corruption'
                ELSE 'abuse'
            END,
            CASE (i % 4)
                WHEN 0 THEN 'open'
                WHEN 1 THEN 'under_investigation'
                WHEN 2 THEN 'resolved'
                ELSE 'escalated'
            END,
            CASE (i % 4)
                WHEN 0 THEN 'low'
                WHEN 1 THEN 'medium'
                WHEN 2 THEN 'high'
                ELSE 'critical'
            END,
            CASE (i % 3)
                WHEN 0 THEN 'VAPIReport'
                WHEN 1 THEN 'MapReport'
                ELSE 'ManualReport'
            END,
            CASE (i % 5)
                WHEN 0 THEN 'New York Office - 42nd Floor'
                WHEN 1 THEN 'Los Angeles Branch - Building A'
                WHEN 2 THEN 'Chicago Facility - Warehouse 3'
                WHEN 3 THEN 'Houston Office - Executive Suite'
                ELSE 'Miami Distribution Center'
            END,
            CASE WHEN (i % 3) = 1 THEN 40.7128 + (random() - 0.5) * 0.1 ELSE NULL END, -- Latitude for MapReports
            CASE WHEN (i % 3) = 1 THEN -74.0060 + (random() - 0.5) * 0.1 ELSE NULL END, -- Longitude for MapReports
            CASE WHEN i % 3 = 0 THEN true ELSE false END, -- is_anonymous
            CASE WHEN i % 3 != 0 THEN 'contact' || i || '@company.com' ELSE NULL END,
            CURRENT_DATE - INTERVAL '1 day' * (random() * 90)::INTEGER, -- date_occurred
            generate_secret_code(),
            generate_10_digit_key(),
            'TRACK-' || generate_10_digit_key(),
            CASE WHEN i % 4 = 2 THEN (random() * 50000 + 5000)::DECIMAL(10,2) ELSE 0 END, -- reward_amount
            CASE WHEN i % 4 = 2 THEN 'paid' ELSE 'pending' END,
            CASE WHEN i % 3 = 0 THEN investigator_id ELSE NULL END,
            ethics_id,
            CASE WHEN i % 4 = 2 THEN 'USDC' ELSE NULL END,
            NOW() - INTERVAL '1 day' * (random() * 30)::INTEGER,
            NOW() - INTERVAL '1 hour' * (random() * 24)::INTEGER
        );
    END LOOP;

    -- 3. INSERT VAPI REPORTS
    FOR i IN 1..10 LOOP
        INSERT INTO public.vapi_reports (
            id, report_id, summary, transcript, audio_url, session_id, status,
            vapi_call_data, created_at, ended_at
        ) VALUES (
            'vapi-' || i || '-' || extract(epoch from now())::bigint,
            generate_10_digit_key(),
            'Voice Report ' || i || ': ' ||
            CASE (i % 5)
                WHEN 0 THEN 'Caller reported financial irregularities in their department with concerns about unauthorized transactions.'
                WHEN 1 THEN 'Anonymous tip about workplace harassment by a senior manager affecting multiple employees.'
                WHEN 2 THEN 'Safety violation report from manufacturing floor with immediate danger to workers.'
                WHEN 3 THEN 'Discrimination complaint regarding hiring practices and unfair treatment of candidates.'
                ELSE 'Corruption allegation involving procurement process and vendor relationships.'
            END,
            'Transcript of voice call ' || i || ': Caller: Hello, I need to report something serious happening at my workplace. Assistant: I understand you want to make a report. Can you tell me more about what you observed? Caller: ' ||
            CASE (i % 5)
                WHEN 0 THEN 'I work in accounting and I have noticed some transactions that do not look right. Money is being moved around without proper documentation.'
                WHEN 1 THEN 'My manager has been making inappropriate comments and creating a hostile environment for several of us.'
                WHEN 2 THEN 'The safety equipment in our plant is not working properly and management knows but is not fixing it.'
                WHEN 3 THEN 'I have seen evidence that certain candidates are being rejected based on their background rather than qualifications.'
                ELSE 'There are kickbacks happening in our procurement department. Vendors are getting contracts based on personal relationships.'
            END || ' Assistant: Thank you for providing this information. I will create a report with tracking code TRACK-' || generate_10_digit_key() || '. Your report will be reviewed by our ethics team.',
            'https://vapi-audio-recordings.s3.amazonaws.com/recording-' || i || '.mp3',
            'session-' || i || '-' || extract(epoch from now())::bigint,
            CASE WHEN i % 3 = 0 THEN 'processed' ELSE 'pending' END,
            jsonb_build_object(
                'cost', (random() * 2 + 0.5)::DECIMAL(4,3),
                'duration', (random() * 300 + 60)::INTEGER,
                'messages', jsonb_build_array(
                    jsonb_build_object('role', 'user', 'message', 'I need to report something', 'secondsFromStart', 0),
                    jsonb_build_object('role', 'assistant', 'message', 'I can help you with that', 'secondsFromStart', 2),
                    jsonb_build_object('role', 'user', 'message', 'There are some issues at my workplace', 'secondsFromStart', 5)
                )
            ),
            NOW() - INTERVAL '1 day' * (random() * 7)::INTEGER,
            NOW() - INTERVAL '1 day' * (random() * 7)::INTEGER + INTERVAL '1 minute' * (random() * 30 + 5)::INTEGER
        );
    END LOOP;

END $$;

-- Create some summary statistics
SELECT 
    'Data Population Complete!' as status,
    (SELECT COUNT(*) FROM public.profiles) as total_profiles,
    (SELECT COUNT(*) FROM public.reports) as total_reports,
    (SELECT COUNT(*) FROM public.vapi_reports) as total_vapi_reports;

-- Show sample data
SELECT 'Sample Reports:' as info;
SELECT case_id, title, category, status, report_source, created_at FROM public.reports LIMIT 5;

SELECT 'Sample VAPI Reports:' as info;
SELECT report_id, summary, status, created_at FROM public.vapi_reports LIMIT 3;

SELECT 'Sample Profiles:' as info;
SELECT first_name, last_name, role, department FROM public.profiles LIMIT 5;
