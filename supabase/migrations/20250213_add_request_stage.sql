-- Map old request statuses to process stages (discover, define, design, develop, deliver, maintain)
UPDATE requests SET status = 'discover' WHERE status IN ('submitted', 'reviewing', 'in_progress', 'on_hold');
UPDATE requests SET status = 'deliver' WHERE status = 'completed';
