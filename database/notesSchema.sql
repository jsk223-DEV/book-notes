CREATE TABLE notes (
	id SERIAL PRIMARY KEY,
	book_id INT REFERENCES books(id),
	text TEXT NOT NULL,
	title VARCHAR(50)
);