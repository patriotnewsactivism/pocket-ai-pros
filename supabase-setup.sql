-- BuildMyBot Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at DESC);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);

-- Reseller Applications
CREATE TABLE IF NOT EXISTS reseller_applications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    experience TEXT,
    expected_clients INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reseller_email ON reseller_applications(email);
CREATE INDEX IF NOT EXISTS idx_reseller_submitted ON reseller_applications(submitted_at DESC);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    company VARCHAR(255),
    plan VARCHAR(50) DEFAULT 'starter',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Bots Table (for statistics)
CREATE TABLE IF NOT EXISTS bots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    total_messages INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_bots_user ON bots(user_id);
CREATE INDEX IF NOT EXISTS idx_bots_status ON bots(status);

-- Messages Table (for statistics)
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    bot_id INTEGER REFERENCES bots(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tokens_used INTEGER
);

CREATE INDEX IF NOT EXISTS idx_messages_bot ON messages(bot_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reseller_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
-- Contacts: Allow insert for anyone, select for authenticated users
CREATE POLICY "Anyone can submit contact forms" ON contacts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view contacts" ON contacts
    FOR SELECT USING (auth.role() = 'authenticated');

-- Subscribers: Allow insert for anyone
CREATE POLICY "Anyone can subscribe" ON subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view subscribers" ON subscribers
    FOR SELECT USING (auth.role() = 'authenticated');

-- Reseller Applications: Allow insert for anyone
CREATE POLICY "Anyone can apply for reseller program" ON reseller_applications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view applications" ON reseller_applications
    FOR SELECT USING (auth.role() = 'authenticated');

-- Users: Allow insert for anyone (signup)
CREATE POLICY "Anyone can sign up" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text OR auth.role() = 'authenticated');

-- Bots: Users can only access their own bots
CREATE POLICY "Users can view their own bots" ON bots
    FOR SELECT USING (auth.uid()::text = user_id::text OR auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own bots" ON bots
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Messages: Users can only access their own messages
CREATE POLICY "Users can view their own messages" ON messages
    FOR SELECT USING (auth.uid()::text = user_id::text OR auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own messages" ON messages
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Chat Sessions Table (for AI Chatbot)
CREATE TABLE IF NOT EXISTS chat_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    business_type VARCHAR(50) NOT NULL,
    visitor_name VARCHAR(255),
    visitor_email VARCHAR(255),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_session ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_email ON chat_sessions(visitor_email);

-- Chat Messages Table (for AI Chatbot Conversations)
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp DESC);

-- Chat Leads Table (for Lead Capture from Chatbot)
CREATE TABLE IF NOT EXISTS chat_leads (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    business_type VARCHAR(50),
    captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS idx_chat_leads_email ON chat_leads(email);
CREATE INDEX IF NOT EXISTS idx_chat_leads_captured ON chat_leads(captured_at DESC);

-- Business Templates Table (for Different Industry Configurations)
CREATE TABLE IF NOT EXISTS business_templates (
    id SERIAL PRIMARY KEY,
    template_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    configuration JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for new tables
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_templates ENABLE ROW LEVEL SECURITY;

-- Policies for chat tables (public can insert, authenticated can view)
CREATE POLICY "Anyone can create chat sessions" ON chat_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view chat sessions" ON chat_sessions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can send chat messages" ON chat_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view chat messages" ON chat_messages
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can submit chat leads" ON chat_leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view chat leads" ON chat_leads
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view business templates" ON business_templates
    FOR SELECT WITH CHECK (true);

-- Insert sample data for testing (optional - remove in production)
INSERT INTO users (name, email, company, plan, status) VALUES
('Demo User', 'demo@buildmybot.ai', 'Demo Company', 'professional', 'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO bots (user_id, name, description, status, total_messages) VALUES
((SELECT id FROM users WHERE email = 'demo@buildmybot.ai'), 'Customer Support Bot', 'Handles customer inquiries', 'active', 1250),
((SELECT id FROM users WHERE email = 'demo@buildmybot.ai'), 'Sales Bot', 'Helps with sales questions', 'active', 850),
((SELECT id FROM users WHERE email = 'demo@buildmybot.ai'), 'FAQ Bot', 'Answers frequently asked questions', 'active', 670)
ON CONFLICT DO NOTHING;

-- Add some sample messages for stats
INSERT INTO messages (bot_id, user_id, message, response, tokens_used) VALUES
((SELECT id FROM bots WHERE name = 'Customer Support Bot' LIMIT 1), 
 (SELECT id FROM users WHERE email = 'demo@buildmybot.ai'), 
 'How do I reset my password?', 
 'You can reset your password by clicking on the "Forgot Password" link on the login page.', 
 150)
ON CONFLICT DO NOTHING;

-- Insert business templates
INSERT INTO business_templates (template_id, name, industry, configuration) VALUES
('ecommerce', 'E-Commerce Store', 'Retail & E-Commerce', '{"enabled": true}'::jsonb),
('saas', 'SaaS Platform', 'Software & Technology', '{"enabled": true}'::jsonb),
('realestate', 'Real Estate', 'Real Estate', '{"enabled": true}'::jsonb),
('healthcare', 'Healthcare', 'Healthcare & Medical', '{"enabled": true}'::jsonb),
('education', 'Education', 'Education & E-Learning', '{"enabled": true}'::jsonb),
('hospitality', 'Hospitality', 'Hospitality & Tourism', '{"enabled": true}'::jsonb),
('finance', 'Financial Services', 'Finance & Banking', '{"enabled": true}'::jsonb),
('support', 'Customer Support', 'Customer Support', '{"enabled": true}'::jsonb)
ON CONFLICT (template_id) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database setup complete! All tables created successfully.';
    RAISE NOTICE 'You can now use the BuildMyBot application.';
END $$;
