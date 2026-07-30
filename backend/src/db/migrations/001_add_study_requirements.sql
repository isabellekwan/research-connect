DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'time_slots_capacity_positive'
  ) THEN
    ALTER TABLE time_slots
      ADD CONSTRAINT time_slots_capacity_positive CHECK (capacity > 0);
  END IF;
END
$$;
