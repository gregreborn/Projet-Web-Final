-- Création de la base de données si elle n'existe pas
--CREATE DATABASE restaurant_db;

-- Connexion à la base de données
--\c restaurant_db;

-- Création d'un rôle utilisateur pour l'application
--CREATE ROLE postgres WITH LOGIN PASSWORD 'admin';
--GRANT ALL PRIVILEGES ON DATABASE restaurant_db TO postgres;

-- Création de la table clients
CREATE TABLE IF NOT EXISTS clients (
                                       id SERIAL PRIMARY KEY,
                                       name VARCHAR(255) NOT NULL,
                                       email VARCHAR(255) UNIQUE NOT NULL,
                                       password TEXT NOT NULL,
                                       is_admin BOOLEAN DEFAULT FALSE
);

-- Création de la table tables
CREATE TABLE IF NOT EXISTS tables (
                                      id SERIAL PRIMARY KEY,
                                      seats INTEGER NOT NULL
);

-- Création de la table reservations
CREATE TABLE IF NOT EXISTS reservations (
                                            id SERIAL PRIMARY KEY,
                                            client_id INTEGER NOT NULL,
                                            table_id INTEGER NOT NULL,
                                            datetime TIMESTAMP NOT NULL,
                                            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
                                            FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE
);

-- Insertion d'un administrateur par défaut
INSERT INTO clients (name, email, password, is_admin) VALUES
    ('Admin User', 'admin@example.com', 'hashed_admin_password', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Insertion d'un utilisateur normal
INSERT INTO clients (name, email, password, is_admin) VALUES
    ('Regular User', 'user@example.com', 'hashed_user_password', FALSE)
ON CONFLICT (email) DO NOTHING;

-- Insertion de quelques tables
INSERT INTO tables (seats) VALUES (2), (4), (6), (8), (10)
ON CONFLICT DO NOTHING;

-- Insertion de quelques réservations de test
INSERT INTO reservations (client_id, table_id, datetime) VALUES
                                                             (1, 2, '2025-03-04 19:00:00'),
                                                             (2, 3, '2025-03-05 20:30:00')
ON CONFLICT DO NOTHING;

-- Accorder l'accès aux tables à l'utilisateur PostgreSQL
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;
