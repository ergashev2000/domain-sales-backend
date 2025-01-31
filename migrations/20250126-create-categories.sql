-- Create categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL CHECK (length(title) BETWEEN 2 AND 100),
    description TEXT,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(255),
    domain_count INTEGER DEFAULT 0 CHECK (domain_count >= 0),
    meta_title VARCHAR(100),
    meta_description VARCHAR(255),
    keywords TEXT[],
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0 CHECK (sort_order >= 0),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Create index for performance
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_domain_count ON categories(domain_count DESC);
CREATE INDEX idx_categories_active ON categories(is_active);
