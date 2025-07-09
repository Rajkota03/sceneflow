-- Create masterplot_conflict_view that joins masterplots with conflict_situations
CREATE VIEW public.masterplot_conflict_view AS
SELECT 
  m.masterplot_id,
  m.a_clause_label,
  m.a_clause_text,
  m.b_clause_label,
  m.b_clause_text,
  m.c_clause_label,
  m.c_clause_text,
  m.conflict_start_id,
  cs.story_type,
  cs.sub_type,
  cs.description as conflict_description,
  cs.lead_outs,
  cs.lead_ins
FROM public.masterplots m
LEFT JOIN public.conflict_situations cs ON m.conflict_start_id = cs.id;