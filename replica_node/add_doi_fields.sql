-- Add DOI and Crossref tracking columns to articles
ALTER TABLE articles 
ADD COLUMN doi VARCHAR(100) NULL,
ADD COLUMN doi_suffix VARCHAR(100) NULL,
ADD COLUMN crossref_deposit_id VARCHAR(100) NULL,
ADD COLUMN crossref_status ENUM('pending', 'submitted', 'registered', 'failed') DEFAULT 'pending',
ADD COLUMN crossref_submitted_at TIMESTAMP NULL,
ADD COLUMN crossref_response TEXT NULL,
ADD COLUMN page_range VARCHAR(50) NULL;

-- Add ISSN to journals table
ALTER TABLE journals
ADD COLUMN issn_print VARCHAR(20) NULL,
ADD COLUMN issn_electronic VARCHAR(20) NULL;
