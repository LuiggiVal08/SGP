-- Migration: Add institutionId to pnfs table
-- Column must match institutions.id collation (utf8mb4_bin)
ALTER TABLE pnfs
  ADD COLUMN institutionId CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL;

ALTER TABLE pnfs
  ADD CONSTRAINT fk_pnf_institution
  FOREIGN KEY (institutionId) REFERENCES institutions(id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Assign existing PNFs to the seed institution (UPPT)
UPDATE pnfs SET institutionId = 'b2000000-0000-4000-8000-000000000001';
