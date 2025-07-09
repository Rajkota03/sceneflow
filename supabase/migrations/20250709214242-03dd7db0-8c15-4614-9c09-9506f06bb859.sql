-- Create user_beats table for storing user-generated beat sheets
CREATE TABLE public.user_beats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  story_title text NOT NULL,
  beats_json jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_beats ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own beats" 
ON public.user_beats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own beats" 
ON public.user_beats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own beats" 
ON public.user_beats 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own beats" 
ON public.user_beats 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_beats_updated_at
BEFORE UPDATE ON public.user_beats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();