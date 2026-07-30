CREATE TABLE IF NOT EXISTS study_views (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id    UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    viewer_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    view_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (study_id, viewer_id, view_date)
);

CREATE INDEX IF NOT EXISTS idx_study_views_study ON study_views(study_id);
CREATE INDEX IF NOT EXISTS idx_study_views_date ON study_views(view_date);
