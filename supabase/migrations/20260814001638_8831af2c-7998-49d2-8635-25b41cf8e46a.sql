CREATE TYPE public.early_access_status AS ENUM ('EARLY_ACCESS','UNDER_REVIEW','SELECTED_FOR_BETA','INVITATION_SENT','BETA_USER','REJECTED');

CREATE TABLE public.early_access_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL DEFAULT 'PulseAssist',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  business_need TEXT,
  source TEXT NOT NULL DEFAULT 'enice_website',
  status public.early_access_status NOT NULL DEFAULT 'EARLY_ACCESS',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX early_access_registrations_product_email_key
  ON public.early_access_registrations (product, lower(email));

GRANT ALL ON public.early_access_registrations TO service_role;

ALTER TABLE public.early_access_registrations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_early_access_registrations_updated_at
BEFORE UPDATE ON public.early_access_registrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();