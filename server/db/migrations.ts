import db from "./connection";

export const runMigrations = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bots (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      summary TEXT NOT NULL,
      industry TEXT NOT NULL,
      primary_goal TEXT NOT NULL,
      tone TEXT NOT NULL,
      status TEXT NOT NULL,
      persona_tagline TEXT,
      persona_voice TEXT,
      persona_strengths TEXT,
      metrics_messages_handled INTEGER DEFAULT 0,
      metrics_avg_response_time REAL DEFAULT 0,
      metrics_csat REAL DEFAULT 0,
      metrics_conversion_rate REAL DEFAULT 0,
      metrics_cost_savings REAL DEFAULT 0,
      metrics_automation_coverage REAL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS knowledge_documents (
      id TEXT PRIMARY KEY,
      bot_id TEXT NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT,
      source TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS conversation_messages (
      id TEXT PRIMARY KEY,
      bot_id TEXT NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_knowledge_documents_bot_id ON knowledge_documents(bot_id);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_conversation_messages_bot_id_created_at ON conversation_messages(bot_id, created_at);
  `);
};

export default runMigrations;
