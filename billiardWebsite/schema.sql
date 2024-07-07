CREATE TABLE covers (
    id SERIAL PRIMARY KEY,
    points INTEGER
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    username TEXT,
    password VARCHAR,
    info TEXT,
    total_points INTEGER,
    logo TEXT
);

CREATE TABLE region (
    id INTEGER PRIMARY KEY,
    points INTEGER,
    color VARCHAR
);

CREATE TABLE has_corner (
    cover_id INTEGER REFERENCES covers(id),
    cornerx INTEGER,
    cornery INTEGER,
    position INTEGER,
    PRIMARY KEY (cover_id, cornerx, cornery)
);

CREATE TABLE user_claimed_cover (
    cover_id INTEGER REFERENCES covers(id),
    user_id UUID REFERENCES users(id),
    claimation_date DATE,
    PRIMARY KEY (cover_id, user_id)
);

CREATE TABLE cover_in_region (
    cover_id INTEGER REFERENCES covers(id),
    region_id INTEGER REFERENCES region(id),
    PRIMARY KEY (cover_id, region_id)
);

CREATE TABLE user_completed_cover (
    cover_id INTEGER REFERENCES covers(id),
    user_id UUID REFERENCES users(id),
    completion_date DATE,
    PRIMARY KEY (cover_id, user_id)
);

CREATE TABLE sessions (
    session_id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    login_date TIMESTAMP,
    ip_address TEXT
);

CREATE TABLE region_has_corner (
    region_id INTEGER REFERENCES region(id),
    cornerx INTEGER,
    cornery INTEGER,
    position INTEGER,
    PRIMARY KEY (region_id, cornerx, cornery)
);