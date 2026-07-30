ALTER TABLE study_applications
  ADD COLUMN IF NOT EXISTS resume_url TEXT;
