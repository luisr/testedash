-- Create activity dependencies table
CREATE TABLE IF NOT EXISTS activity_dependencies (
    id SERIAL PRIMARY KEY,
    predecessor_id INTEGER NOT NULL REFERENCES activities(id),
    successor_id INTEGER NOT NULL REFERENCES activities(id),
    dependency_type TEXT NOT NULL DEFAULT 'finish_to_start',
    lag_time INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create activity constraints table
CREATE TABLE IF NOT EXISTS activity_constraints (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER NOT NULL REFERENCES activities(id),
    constraint_type TEXT NOT NULL,
    constraint_date TIMESTAMP NOT NULL,
    priority TEXT DEFAULT 'medium',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add new columns to activities table
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS duration INTEGER,
ADD COLUMN IF NOT EXISTS buffer_time INTEGER,
ADD COLUMN IF NOT EXISTS is_auto_scheduled BOOLEAN,
ADD COLUMN IF NOT EXISTS critical_path BOOLEAN;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_dependencies_predecessor ON activity_dependencies(predecessor_id);
CREATE INDEX IF NOT EXISTS idx_activity_dependencies_successor ON activity_dependencies(successor_id);
CREATE INDEX IF NOT EXISTS idx_activity_constraints_activity ON activity_constraints(activity_id);
CREATE INDEX IF NOT EXISTS idx_activities_duration ON activities(duration);
CREATE INDEX IF NOT EXISTS idx_activities_critical_path ON activities(critical_path);

-- Add some sample dependencies for testing
INSERT INTO activity_dependencies (predecessor_id, successor_id, dependency_type, lag_time, is_active)
VALUES 
    (1, 2, 'finish_to_start', 0, true),
    (1, 3, 'finish_to_start', 0, true),
    (2, 4, 'finish_to_start', 0, true),
    (3, 4, 'finish_to_start', 0, true)
ON CONFLICT DO NOTHING;

-- Add some sample constraints for testing
INSERT INTO activity_constraints (activity_id, constraint_type, constraint_date, priority, description, is_active)
VALUES 
    (1, 'must_start_on', '2024-01-01 08:00:00', 'high', 'Início obrigatório do projeto', true),
    (4, 'finish_no_later_than', '2024-05-31 17:00:00', 'high', 'Deadline do projeto', true)
ON CONFLICT DO NOTHING;