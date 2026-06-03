-- Add soft delete and edit tracking to chat_messages
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;
