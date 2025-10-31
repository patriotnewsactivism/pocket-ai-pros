-- BuildMyBot Database Schema
-- REAL database tables - NO mock or test data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contacts Table
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'new',
    assigned_to INTEGER,
    notes TEXT
);

CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_created ON contacts(created_at DESC);

-- Newsletter Subscribers
CREATE TABLE subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    unsubscribed_at TIMESTAMP,
    source VARCHAR(100)
);

CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_status ON subscribers(status);

-- Reseller Applications
CREATE TABLE reseller_applications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    experience TEXT,
    expected_clients INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER,
    notes TEXT,
    commission_rate DECIMAL(5,2)
);

CREATE INDEX idx_reseller_email ON reseller_applications(email);
CREATE INDEX idx_reseller_status ON reseller_applications(status);
CREATE INDEX idx_reseller_submitted ON reseller_applications(submitted_at DESC);

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    company VARCHAR(255),
    plan VARCHAR(50) DEFAULT 'starter',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    email_verified BOOLEAN DEFAULT false,
    phone VARCHAR(50),
    avatar_url TEXT
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_plan ON users(plan);

-- Pricing Plans
CREATE TABLE pricing_plans (
    id SERIAL PRIMARY KEY,
    plan_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    features JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert real pricing plans
INSERT INTO pricing_plans (plan_id, name, price, features) VALUES
('starter', 'Starter', 29.00, '["1 Custom AI Bot", "1,000 messages/month", "GPT-4o-mini powered", "Basic analytics", "Email support", "Standard training data"]'),
('professional', 'Professional', 99.00, '["5 Custom AI Bots", "10,000 messages/month", "GPT-4o-mini powered", "Advanced analytics", "Priority support", "Custom training data", "API access", "Multi-language support"]'),
('enterprise', 'Enterprise', 299.00, '["Unlimited AI Bots", "Unlimited messages", "GPT-4o-mini + premium models", "Enterprise analytics", "24/7 dedicated support", "Custom integrations", "White-label options", "SLA guarantee", "Team collaboration"]');

-- Bots Table (for statistics)
CREATE TABLE bots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    last_active TIMESTAMP,
    total_messages INTEGER DEFAULT 0
);

CREATE INDEX idx_bots_user ON bots(user_id);
CREATE INDEX idx_bots_status ON bots(status);

-- Messages Table (for statistics)
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    bot_id INTEGER REFERENCES bots(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tokens_used INTEGER,
    processing_time INTEGER
);

CREATE INDEX idx_messages_bot ON messages(bot_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Activity Log
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);

-- API Keys (for external integrations)
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    last_used TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- Payments/Subscriptions (if using Stripe)
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) REFERENCES pricing_plans(plan_id),
    stripe_subscription_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Functions for statistics
CREATE OR REPLACE FUNCTION get_total_bots()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM bots WHERE status = 'active');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_active_users()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM users WHERE status = 'active');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_total_messages()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM messages);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update bot message count
CREATE OR REPLACE FUNCTION update_bot_message_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE bots 
    SET total_messages = total_messages + 1,
        last_active = NEW.created_at
    WHERE id = NEW.bot_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bot_messages
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_bot_message_count();

-- Sample data for testing (OPTIONAL - remove in production)
-- Uncomment if you need test data during development

-- INSERT INTO users (name, email, company, plan, status) VALUES
-- ('John Doe', 'john@example.com', 'Acme Inc', 'professional', 'active'),
-- ('Jane Smith', 'jane@example.com', 'Tech Corp', 'starter', 'active');

-- INSERT INTO bots (user_id, name, description, status) VALUES
-- (1, 'Customer Support Bot', 'Handles customer inquiries', 'active'),
-- (1, 'Sales Bot', 'Helps with sales questions', 'active'),
-- (2, 'FAQ Bot', 'Answers frequently asked questions', 'active');

-- INSERT INTO messages (bot_id, user_id, message, response) VALUES
-- (1, 1, 'How do I reset my password?', 'You can reset your password by clicking...'),
-- (1, 1, 'What are your business hours?', 'We are open Monday through Friday...'),
-- (2, 1, 'Tell me about your products', 'We offer a range of products including...');

COMMENT ON TABLE contacts IS 'Stores contact form submissions - REAL data only';
COMMENT ON TABLE subscribers IS 'Newsletter subscribers - REAL data only';
COMMENT ON TABLE reseller_applications IS 'Reseller program applications - REAL data only';
COMMENT ON TABLE users IS 'User accounts - REAL data only';
COMMENT ON TABLE pricing_plans IS 'Available pricing plans - REAL data only';
COMMENT ON TABLE bots IS 'User-created bots - REAL data only';
COMMENT ON TABLE messages IS 'Bot messages - REAL data only';
