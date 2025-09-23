-- Initial database setup
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
    ('Food & Dining', 'Restaurants, groceries, and food delivery'),
    ('Transportation', 'Gas, public transport, ride-sharing'),
    ('Shopping', 'Clothes, electronics, and general shopping'),
    ('Entertainment', 'Movies, games, and recreational activities'),
    ('Bills & Utilities', 'Electricity, water, internet, phone bills'),
    ('Health & Fitness', 'Medical expenses, gym, supplements'),
    ('Travel', 'Flights, hotels, vacation expenses'),
    ('Education', 'Books, courses, and learning materials'),
    ('Other', 'Miscellaneous expenses')
ON CONFLICT DO NOTHING;