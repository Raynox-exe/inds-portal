-- Migration script to add download control to articles table
ALTER TABLE articles ADD COLUMN download_enabled BOOLEAN DEFAULT TRUE;

-- Fix any inconsistent column names if they exist (standardizing to file_path)
-- This is a safety measure
-- ALTER TABLE articles CHANGE COLUMN IF EXISTS pdf_path file_path VARCHAR(255);
