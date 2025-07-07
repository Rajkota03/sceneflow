-- Create scenes table for screenplay content
CREATE TABLE public.scenes (
  id TEXT NOT NULL PRIMARY KEY,
  project_id TEXT NOT NULL,
  scene_number INTEGER,
  title TEXT,
  content_richtext JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_fountain TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  author_id UUID NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own scenes" 
ON public.scenes 
FOR SELECT 
USING (auth.uid() = author_id);

CREATE POLICY "Users can create their own scenes" 
ON public.scenes 
FOR INSERT 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own scenes" 
ON public.scenes 
FOR UPDATE 
USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own scenes" 
ON public.scenes 
FOR DELETE 
USING (auth.uid() = author_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scenes_updated_at
BEFORE UPDATE ON public.scenes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();