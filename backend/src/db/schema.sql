CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('researcher', 'participant');
CREATE TYPE study_status AS ENUM ('draft', 'open', 'closed', 'archived');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled', 'completed');
CREATE TYPE ledger_type AS ENUM ('credit', 'debit');

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id       TEXT UNIQUE NOT NULL,
    email           TEXT UNIQUE NOT NULL,
    name            TEXT NOT NULL,
    avatar_url      TEXT,
    role            user_role,              -- NULL until the user completes role selection post sign-up
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE studies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    researcher_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT NOT NULL,
    category        TEXT NOT NULL,          -- e.g. "Cognitive Science", "UX Research"
    location        TEXT,                   -- free text or "Remote"
    is_remote       BOOLEAN NOT NULL DEFAULT false,
    compensation    NUMERIC(10, 2),          -- flat compensation amount, mirrored into ledger on completion
    status          study_status NOT NULL DEFAULT 'draft',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_studies_status ON studies(status);
CREATE INDEX idx_studies_category ON studies(category);
CREATE INDEX idx_studies_researcher ON studies(researcher_id);

CREATE TABLE screening_questions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id            UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    question_text       TEXT NOT NULL,
    qualifying_answer   BOOLEAN NOT NULL,   -- the boolean answer that qualifies the participant
    order_index         INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_screening_questions_study ON screening_questions(study_id);

CREATE TABLE study_applications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id        UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    participant_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          application_status NOT NULL DEFAULT 'pending',
    screening_answers JSONB NOT NULL DEFAULT '[]', 
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (study_id, participant_id)
);

CREATE INDEX idx_study_applications_participant ON study_applications(participant_id);
CREATE INDEX idx_study_applications_study ON study_applications(study_id);

CREATE TABLE time_slots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id        UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ NOT NULL,
    capacity        INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (end_time > start_time)
);

CREATE INDEX idx_time_slots_study ON time_slots(study_id);

CREATE TABLE bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    time_slot_id    UUID NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
    participant_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          booking_status NOT NULL DEFAULT 'confirmed',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (time_slot_id, participant_id)
);

CREATE INDEX idx_bookings_participant ON bookings(participant_id);
CREATE INDEX idx_bookings_time_slot ON bookings(time_slot_id);

CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (author_id <> subject_id)
);

CREATE INDEX idx_reviews_subject ON reviews(subject_id);
CREATE INDEX idx_reviews_author ON reviews(author_id);

CREATE TABLE chat_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id        UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message         TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_study ON chat_messages(study_id);

CREATE TABLE ledger_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id      UUID REFERENCES bookings(id) ON DELETE SET NULL,
    type            ledger_type NOT NULL,
    amount          NUMERIC(10, 2) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ledger_entries_user ON ledger_entries(user_id);

CREATE TABLE study_views (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id        UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    viewer_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    view_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (study_id, viewer_id, view_date)
);

CREATE INDEX idx_study_views_study ON study_views(study_id);
CREATE INDEX idx_study_views_date ON study_views(view_date);