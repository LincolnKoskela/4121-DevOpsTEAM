CREATE TABLE incidents (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    description TEXT,
    priority    TEXT NOT NULL CHECK (priority IN ('P0','P1','P2','P3')),
    status      TEXT NOT NULL DEFAULT 'open'
                CHECK (status IN ('open','investigating','resolved','closed')),
    declared_by TEXT NOT NULL,
    declared_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE responders (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    user_name   TEXT NOT NULL,
    role        TEXT NOT NULL CHECK (role IN ('incident-commander','responder','observer')),
    assigned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE alert_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    source      TEXT NOT NULL,
    payload     JSONB NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE runbooks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    steps       JSONB NOT NULL DEFAULT '[]',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

