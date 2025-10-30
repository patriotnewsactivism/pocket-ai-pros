import Database from "better-sqlite3";
import { ensureDirSync } from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultPath = path.resolve(__dirname, "../../data/buildmybot.db");
const databasePath = process.env.DATABASE_PATH ? path.resolve(process.env.DATABASE_PATH) : defaultPath;

ensureDirSync(path.dirname(databasePath));

const db = new Database(databasePath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export default db;
