-- Update the applications table constraint to allow 'completed' status
ALTER TABLE public.applications 
DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE public.applications 
ADD CONSTRAINT applications_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'waitlisted', 'canceled', 'completed'));