CREATE TABLE IF NOT EXISTS permissions (
    permission_id SERIAL PRIMARY KEY,
    role          VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS hotels (
    hotel_id    SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    address     VARCHAR(255) NOT NULL,
    city        VARCHAR(255) NOT NULL,
    country     VARCHAR(255) NOT NULL,
    star_rating INTEGER CHECK (star_rating BETWEEN 1 AND 5),
    phone       VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS users (
    user_id          SERIAL PRIMARY KEY,
    email            VARCHAR(255) NOT NULL UNIQUE,
    password_hash    VARCHAR(255) NOT NULL,
    phone            VARCHAR(255),
    full_name        VARCHAR(255) NOT NULL,
    is_blacklisted   BOOLEAN NOT NULL DEFAULT FALSE,
    permission_level INTEGER NOT NULL REFERENCES permissions(permission_id),
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
    room_id         SERIAL PRIMARY KEY,
    hotel_id        INTEGER NOT NULL REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    room_number     VARCHAR(50) NOT NULL,
    room_type       VARCHAR(50) NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    capacity        INTEGER NOT NULL,
    floor           INTEGER NOT NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'available'
);

CREATE TABLE IF NOT EXISTS discount_programs (
    discount_id      SERIAL PRIMARY KEY,
    name             VARCHAR(255) NOT NULL,
    discount_percent DECIMAL(5, 2) NOT NULL CHECK (discount_percent BETWEEN 0 AND 100),
    min_bookings     INTEGER NOT NULL DEFAULT 0,
    description      TEXT,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    start_date       DATE NOT NULL,
    end_date         DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS user_discounts (
    user_discount_id SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    discount_id      INTEGER NOT NULL REFERENCES discount_programs(discount_id) ON DELETE CASCADE,
    joined_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    total_bookings   INTEGER NOT NULL DEFAULT 0,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS bookings (
    booking_id     SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    room_id        INTEGER NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
    discount_id    INTEGER REFERENCES discount_programs(discount_id) ON DELETE SET NULL,
    check_in_date  DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_price    DECIMAL(10, 2) NOT NULL,
    status         VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    CHECK (check_out_date > check_in_date)
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id     SERIAL PRIMARY KEY,
    booking_id     INTEGER NOT NULL UNIQUE REFERENCES bookings(booking_id) ON DELETE CASCADE,
    amount         DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status         VARCHAR(50) NOT NULL DEFAULT 'pending',
    paid_at        TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    review_id  SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    hotel_id   INTEGER NOT NULL REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    content    TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employee_logs (
    log_id      SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    action      VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
