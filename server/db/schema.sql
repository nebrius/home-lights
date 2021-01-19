CREATE TABLE IF NOT EXISTS "zones" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS "schedule" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  zone_id INTEGER NOT NULL,
  entries TEXT NOT NULL,
  FOREIGN KEY (zone_id) REFERENCES zones(id)
);
CREATE TABLE IF NOT EXISTS "scenes" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  lights TEXT NOT NULL,
  brightness INTEGER NOT NULL DEFAULT 255,
  zone_id INTEGER,
  FOREIGN KEY (zone_id) REFERENCES zones(id),
  UNIQUE (name, zone_id)
);
CREATE TABLE IF NOT EXISTS "patterns" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  data TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS "lights" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  channel INTEGER UNIQUE,
  philips_hue_id TEXT UNIQUE,
  lifx_id TEXT UNIQUE,
  zone_id INTEGER,
  FOREIGN KEY (zone_id) REFERENCES zones(id)
);
CREATE TABLE IF NOT EXISTS "philips_hue_info" (
  username TEXT NOT NULL UNIQUE,
  key TEXT NOT NULL,
  ip TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS "migrations" (
  migration INTEGER NOT NULL,
  date TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "settings" (
  theme TEXT NOT NULL
);
