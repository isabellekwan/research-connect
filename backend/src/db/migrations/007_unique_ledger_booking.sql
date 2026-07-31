ALTER TABLE ledger_entries
ADD CONSTRAINT ledger_entries_booking_id_key UNIQUE (booking_id);
