CREATE TABLE books (
	id SERIAL PRIMARY KEY,
	title VARCHAR(100) NOT NULL,
	author VARCHAR(50) NOT NULL,
	status VARCHAR(50) NOT NULL,
	date_added VARCHAR(50),
	review TEXT,
	rating INT,
	cover_id VARCHAR(50),
	isbn VARCHAR(50),
	genre VARCHAR(50),
	tags VARCHAR(100)
);

ALTER TABLE books
ADD key VARCHAR(50);