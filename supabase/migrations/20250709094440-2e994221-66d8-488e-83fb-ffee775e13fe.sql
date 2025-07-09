-- Create conflict_situations table
CREATE TABLE public.conflict_situations (
  id INTEGER NOT NULL PRIMARY KEY,
  story_type TEXT,
  sub_type TEXT,
  description TEXT,
  lead_outs TEXT,
  lead_ins TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.conflict_situations ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (reference data)
CREATE POLICY "Public read access to conflict_situations" 
ON public.conflict_situations 
FOR SELECT 
USING (true);

-- Only authenticated users can modify conflict_situations
CREATE POLICY "Authenticated users can insert conflict_situations" 
ON public.conflict_situations 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update conflict_situations" 
ON public.conflict_situations 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete conflict_situations" 
ON public.conflict_situations 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_conflict_situations_updated_at
BEFORE UPDATE ON public.conflict_situations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for efficient querying
CREATE INDEX idx_conflict_situations_story_type ON public.conflict_situations(story_type);
CREATE INDEX idx_conflict_situations_sub_type ON public.conflict_situations(sub_type);