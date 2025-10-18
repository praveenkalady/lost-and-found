-- Create user roles enum
CREATE TYPE user_role AS ENUM ('finder', 'owner', 'admin', 'custodian');

-- Create item status enum
CREATE TYPE item_status AS ENUM ('lost', 'found', 'matched', 'returned');

-- Create message status enum
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');

-- Users/Profiles table
CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role DEFAULT 'owner',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items table (both lost and found)
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    status item_status NOT NULL,
    location VARCHAR(255) NOT NULL,
    date_lost_found DATE NOT NULL,
    image_url VARCHAR(500),
    reward_offered DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    status message_status DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custodians table (drop-off locations)
CREATE TABLE custodians (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    operating_hours VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drop-off requests table
CREATE TABLE dropoff_requests (
    id SERIAL PRIMARY KEY,
    finder_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    custodian_id INTEGER REFERENCES custodians(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    drop_off_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pickup requests table
CREATE TABLE pickup_requests (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    custodian_id INTEGER REFERENCES custodians(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    pickup_date TIMESTAMP,
    verification_code VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Item history table (for tracking item lifecycle)
CREATE TABLE item_history (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    performed_by INTEGER REFERENCES profiles(id),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_date ON items(date_lost_found);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_item ON messages(item_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_dropoff_finder ON dropoff_requests(finder_id);
CREATE INDEX idx_pickup_owner ON pickup_requests(owner_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custodians_updated_at BEFORE UPDATE ON custodians
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dropoff_requests_updated_at BEFORE UPDATE ON dropoff_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pickup_requests_updated_at BEFORE UPDATE ON pickup_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user (password: admin123)
INSERT INTO profiles (email, password_hash, full_name, role, is_verified)
VALUES ('admin@lostandfound.com', '$2a$10$8X8X8X8X8X8X8X8X8X8X8OxGU9VKX8X8X8X8X8X8X8X8X8X8X8X8', 'Admin User', 'admin', TRUE);

-- Insert sample custodian locations
INSERT INTO custodians (name, location, address, phone, operating_hours)
VALUES 
    ('Central Police Station', 'Downtown', '123 Main Street, City Center', '+1-555-0100', 'Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-5PM'),
    ('City Hall Lost & Found', 'City Center', '456 Government Ave', '+1-555-0200', 'Mon-Fri: 9AM-5PM'),
    ('Airport Lost & Found', 'International Airport', 'Terminal 1, Ground Floor', '+1-555-0300', '24/7');
