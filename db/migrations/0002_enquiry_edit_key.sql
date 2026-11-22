-- A private key held by the browser form that created an enquiry. Only a resend
-- carrying the same key may update the record, so knowing a reference (it is
-- printed in the WhatsApp message) is not enough to overwrite an enquiry.
-- Rows from before this migration have no key and can no longer be updated.
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS edit_key text;
