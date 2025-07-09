-- Create table for storing beat generation history
CREATE TABLE public.beat_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  theme TEXT NOT NULL,
  structure_type TEXT NOT NULL,
  custom_prompt TEXT,
  generated_beats JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing beat generation templates
CREATE TABLE public.beat_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  genre TEXT NOT NULL,
  theme TEXT NOT NULL,
  structure_type TEXT NOT NULL,
  custom_prompt TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.beat_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beat_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for beat_generations
CREATE POLICY "Users can view their own beat generations" 
ON public.beat_generations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own beat generations" 
ON public.beat_generations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own beat generations" 
ON public.beat_generations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own beat generations" 
ON public.beat_generations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for beat_templates
CREATE POLICY "Users can view their own templates and public templates" 
ON public.beat_templates 
FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own templates" 
ON public.beat_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" 
ON public.beat_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" 
ON public.beat_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_beat_generations_updated_at
BEFORE UPDATE ON public.beat_generations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_beat_templates_updated_at
BEFORE UPDATE ON public.beat_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();