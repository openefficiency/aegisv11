-- Insert sample profiles
INSERT INTO profiles (id, email, first_name, last_name, role, department, phone) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@aegiswhistle.com', 'System', 'Administrator', 'admin', 'IT', '+1-555-0001'),
('22222222-2222-2222-2222-222222222222', 'ethics@aegiswhistle.com', 'Sarah', 'Johnson', 'ethics_officer', 'Compliance', '+1-555-0002'),
('33333333-3333-3333-3333-333333333333', 'investigator@aegiswhistle.com', 'Mike', 'Chen', 'investigator', 'Security', '+1-555-0003'),
('44444444-4444-4444-4444-444444444444', 'jane.doe@aegiswhistle.com', 'Jane', 'Doe', 'ethics_officer', 'HR', '+1-555-0004'),
('55555555-5555-5555-5555-555555555555', 'john.smith@aegiswhistle.com', 'John', 'Smith', 'investigator', 'Legal', '+1-555-0005')
ON CONFLICT (email) DO NOTHING;

-- Insert sample reports with 10-digit keys
INSERT INTO reports (
    case_id, case_number, title, description, category, status, priority, 
    report_source, secret_code, report_id, is_anonymous, created_at
) VALUES
('ABC1234567', 'CASE-2024-001', 'Financial Irregularities in Accounting', 'Employee reports suspicious transactions and missing documentation in the accounting department.', 'fraud', 'open', 'high', 'VAPIReport', 'SEC001', 'RPT1234567', true, NOW() - INTERVAL '2 days'),
('DEF2345678', 'CASE-2024-002', 'Workplace Harassment Report', 'Multiple employees report inappropriate behavior from supervisor.', 'harassment', 'under_investigation', 'high', 'ManualReport', 'SEC002', 'RPT2345678', false, NOW() - INTERVAL '1 day'),
('GHI3456789', 'CASE-2024-003', 'Safety Violation in Manufacturing', 'Improper handling of hazardous materials reported.', 'safety', 'open', 'critical', 'MapReport', 'SEC003', 'RPT3456789', true, NOW() - INTERVAL '3 hours'),
('JKL4567890', 'CASE-2024-004', 'Discrimination in Hiring Process', 'Candidate reports discriminatory questions during interview.', 'discrimination', 'open', 'medium', 'ManualReport', 'SEC004', 'RPT4567890', false, NOW() - INTERVAL '6 hours'),
('MNO5678901', 'CASE-2024-005', 'Corruption in Procurement', 'Vendor selection process appears to be compromised.', 'corruption', 'escalated', 'high', 'VAPIReport', 'SEC005', 'RPT5678901', true, NOW() - INTERVAL '12 hours')
ON CONFLICT (case_id) DO NOTHING;

-- Insert sample VAPI reports
INSERT INTO vapi_reports (
    id, report_id, summary, transcript, session_id, status, created_at
) VALUES
('call_001', 'RPT1234567', 'Employee reports suspected financial fraud in accounting department.', 'Hello, I need to report something important. I work in the accounting department and I''ve noticed some irregular transactions...', 'session_001', 'processed', NOW() - INTERVAL '2 days'),
('call_002', 'RPT5678901', 'Report of corruption in procurement process.', 'I''m calling because I''ve noticed that the vendor selection process seems to be rigged...', 'session_002', 'processed', NOW() - INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;

-- Insert sample case updates
INSERT INTO case_updates (case_id, message, update_type, is_public, created_by) VALUES
('ABC1234567', 'Case has been assigned to investigator for initial review.', 'progress', true, '22222222-2222-2222-2222-222222222222'),
('DEF2345678', 'Investigation is ongoing. Interviews scheduled with affected parties.', 'progress', true, '33333333-3333-3333-3333-333333333333'),
('GHI3456789', 'Safety team has been notified. Immediate corrective actions implemented.', 'progress', true, '22222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

-- Insert sample investigator queries
INSERT INTO investigator_queries (case_id, investigator_id, query_text, status) VALUES
('ABC1234567', '33333333-3333-3333-3333-333333333333', 'Can you provide more details about the specific transactions that seemed irregular?', 'pending'),
('DEF2345678', '33333333-3333-3333-3333-333333333333', 'Are there any witnesses to the inappropriate behavior you mentioned?', 'pending')
ON CONFLICT DO NOTHING;

-- Insert sample audit trail entries
INSERT INTO audit_trail (user_id, action, entity_type, entity_id, details) VALUES
('22222222-2222-2222-2222-222222222222', 'CASE_CREATED', 'report', 'ABC1234567', '{"source": "vapi", "priority": "high"}'),
('33333333-3333-3333-3333-333333333333', 'CASE_ASSIGNED', 'report', 'DEF2345678', '{"assigned_to": "investigator"}'),
('22222222-2222-2222-2222-222222222222', 'STATUS_UPDATED', 'report', 'GHI3456789', '{"old_status": "open", "new_status": "escalated"}')
ON CONFLICT DO NOTHING;
