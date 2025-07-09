-- Create masterplots table
CREATE TABLE public.masterplots (
  masterplot_id TEXT NOT NULL PRIMARY KEY,
  a_clause_label TEXT,
  a_clause_text TEXT,
  b_clause_label TEXT,
  b_clause_text TEXT,
  c_clause_label TEXT,
  c_clause_text TEXT,
  conflict_start_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.masterplots ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this seems like reference data)
CREATE POLICY "Public read access to masterplots" 
ON public.masterplots 
FOR SELECT 
USING (true);

-- Only authenticated users can modify masterplots
CREATE POLICY "Authenticated users can insert masterplots" 
ON public.masterplots 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update masterplots" 
ON public.masterplots 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete masterplots" 
ON public.masterplots 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_masterplots_updated_at
BEFORE UPDATE ON public.masterplots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();