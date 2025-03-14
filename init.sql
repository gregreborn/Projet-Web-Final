-- Connexion à la base de données
\c restaurant_db;

-- Création d'un rôle utilisateur pour l'application
--CREATE ROLE postgres WITH LOGIN PASSWORD 'admin';
--GRANT ALL PRIVILEGES ON DATABASE restaurant_db TO postgres;

-- Suppression des tables existantes pour réinitialisation (facultatif mais recommandé pour dev)
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS tables;
DROP TABLE IF EXISTS clients;

-- Création de la table clients
CREATE TABLE IF NOT EXISTS clients (
                                       id SERIAL PRIMARY KEY,
                                       name VARCHAR(255) NOT NULL,
                                       email VARCHAR(255) UNIQUE NOT NULL,
                                       password TEXT NOT NULL,
                                       is_admin BOOLEAN DEFAULT FALSE
);

-- Création de la table tables avec les règles de capacité
CREATE TABLE IF NOT EXISTS tables (
                                      id SERIAL PRIMARY KEY,
                                      seats INTEGER NOT NULL CHECK (seats >= 1)
);

-- Création de la table reservations avec num_people
CREATE TABLE IF NOT EXISTS reservations (
                                            id SERIAL PRIMARY KEY,
                                            client_id INTEGER NOT NULL,
                                            table_id INTEGER NOT NULL,
                                            num_people INTEGER NOT NULL,
                                            datetime TIMESTAMP NOT NULL,
                                            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
                                            FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE
);


-- Insertion d'un administrateur par défaut
INSERT INTO clients (name, email, password, is_admin) VALUES
    ('Admin User', 'admin@example.com', '$2b$10$zV5njIM/KFs3XxJCvFPQL.5E53oz/l3vl1OUxLUNq5ip3qHkvx.K.', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Insertion d'un utilisateur normal
INSERT INTO clients (name, email, password, is_admin) VALUES
    ('Regular User', 'user@example.com', '$2b$10$bRKxLpXNzhUeY7muQti1u.huSTC/Kj/t3mHy9YvvJ5YHpRWKaq1qK', FALSE)
ON CONFLICT (email) DO NOTHING;


-- Initialisation des tables selon la capacité définie
INSERT INTO tables (seats) VALUES
                               (2), (2),        -- 2 tables pour 2 personnes
                               (4), (4), (4), (4),  -- 4 tables pour 4 personnes
                               (6), (6), (6), (6)   -- 4 tables pour 6 personnes
ON CONFLICT DO NOTHING;

-- Insertion de quelques réservations de test
INSERT INTO reservations (client_id, table_id, num_people, datetime) VALUES
                                                                         (1, 1, 2, '2025-03-04 19:00:00'),
                                                                         (2, 3, 4, '2025-03-05 20:30:00')
ON CONFLICT DO NOTHING;

-- Accorder l'accès aux tables à l'utilisateur PostgreSQL
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;
