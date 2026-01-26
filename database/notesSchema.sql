CREATE TABLE notes (
	id SERIAL PRIMARY KEY,
	book_id INT REFERENCES books(id),
	text TEXT NOT NULL,
	title VARCHAR(50)
);

ALTER TABLE notes
ADD date_added VARCHAR(50),
ADD chapter VARCHAR(25),
ADD page_number VARCHAR(25);