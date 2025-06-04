-- Create a function to create the reports table if it doesn't exist
CREATE OR REPLACE FUNCTION create_reports_table()
RETURNS void AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'reports'
  ) THEN
    -- Create the reports table
    CREATE TABLE public.reports (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      case_id TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      date_occurred TEXT,
      is_anonymous BOOLEAN DEFAULT true,
      contact_info TEXT,
      status TEXT DEFAULT 'open',
      priority TEXT DEFAULT 'medium',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add indexes
    CREATE INDEX idx_reports_case_id ON public.reports(case_id);
    CREATE INDEX idx_reports_status ON public.reports(status);
    CREATE INDEX idx_reports_category ON public.reports(category);
    CREATE INDEX idx_reports_created_at ON public.reports(created_at);
    
    -- Enable RLS
    ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Enable read access for authenticated users" 
      ON public.reports FOR SELECT 
      USING (auth.role() = 'authenticated');
      
    CREATE POLICY "Enable insert access for all users" 
      ON public.reports FOR INSERT 
      WITH CHECK (true);
  END IF;
END;
$$ LANGUAGE plpgsql;
