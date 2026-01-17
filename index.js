import express from 'express';
import axios from 'axios';
import pg from 'pg';
import { format } from 'date-fns';

const app = express();
const port = 3000;

const searchUrl = 'https://openlibrary.org';
const coverUrl = 'https://covers.openlibrary.org/b/';

const db = new pg.Client({
	host: 'localhost',
	port: 5432,
	database: 'library',
	user: 'postgres',
	password: '1035pg$T8',
});

db.connect();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
	const filter = req.query.filter;
	try {
		let result;
		if (filter) {
			result = await db.query('SELECT * FROM books WHERE status = $1 ORDER BY id DESC', [
				filter,
			]);
		} else {
			result = await db.query('SELECT * FROM books ORDER BY id DESC');
		}
		res.render('index.ejs', { books: result.rows, filter });
	} catch (err) {
		console.log(err);
		res.render('index.ejs');
	}
});

app.post('/search', async (req, res) => {
	const search = req.body.search;
	const type = req.body.typeOfSearch;
	const result = await axios.get(
		`${searchUrl}/search.json?${type}=${search.replace(
			' ',
			'+'
		)}&fields=author_name,title,key,cover_i,language&limit=10`
	);
	res.render('searchResults.ejs', { searchResults: result.data.docs });
});

app.get('/book-details', async (req, res) => {
	const key = req.query.key;
	const result = await axios.get(`${searchUrl}/${key}.json`);
	result.data.authors = await parseAuthors(result.data.authors);
	result.data.description = parseDesrciption(result.data.description);
	result.data.suggestedGenres = getGenres(result.data.subjects);
	//console.log('Subjects: ', result.data.subjects);

	res.render('bookDetails.ejs', { book: result.data });
});

app.post('/save-book', async (req, res) => {
	try {
		await db.query(
			'INSERT INTO books (title, author, status, date_added, review, rating, cover_id, genre) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
			[
				req.body.title,
				req.body.author,
				req.body.status,
				format(new Date(), 'MMMM d, y'),
				req.body.review,
				parseInt(req.body.rating) || 0,
				req.body.cover,
				req.body.genre,
			]
		);
		res.redirect('/');
	} catch (err) {
		console.log(err);
		res.redirect('/');
	}
});

app.get('/update-status', async (req, res) => {
	const id = req.query.id;
	const statuses = ['to read', 'reading now', 'have read'];
	try {
		const result = await db.query('SELECT * FROM books WHERE id = $1', [id]);
		let status = result.rows[0].status;
		let statusI = statuses.findIndex((s) => s == status);
		let newStatus = statuses[(statusI + 1) % statuses.length];
		await db.query('UPDATE books SET status = $1 WHERE id = $2', [newStatus, id]);
		res.redirect('/');
	} catch (err) {
		console.log(err);
		res.redirect('/');
	}
});

app.get('/delete-book', async (req, res) => {
	try {
		const id = req.query.id;
		await db.query('DELETE FROM books WHERE id = $1', [id]);
		res.redirect('/');
	} catch (err) {
		console.log(err);
		res.redirect('/');
	}
});

app.listen(port, () => {
	console.log(`Listening at localhost:${port}`);
});

function getGenres(subjects) {
	if (typeof subjects != 'object') {
		return [];
	}
	//console.log(subjects);
	const genres = [
		'fiction',
		'nonfiction',
		'fantasy',
		'history',
		'romance',
		'biography',
		'autobiography',
		'psychology',
		'philosophy',
		'self-help',
		'self help',
		'faith',
	];
	let suggestedGenres = [];
	subjects.forEach((sub) => {
		//console.log('Sub: ', sub);
		genres.forEach((gen) => {
			if (sub.toLowerCase().indexOf(gen) != -1) {
				// console.log('Gen: ', gen);
				suggestedGenres.push(gen);
			}
		});
	});
	// console.log('suggestedGenres: ', suggestedGenres);
	suggestedGenres = suggestedGenres.filter(
		(item, index) => suggestedGenres.indexOf(item) === index
	);
	return suggestedGenres;
}

async function parseAuthors(authors) {
	const a = [];
	for (let i = 0; i < authors.length; i++) {
		const authorResult = await axios.get(`${searchUrl}${authors[i].author.key}.json`);
		const name = authorResult.data.name;
		a.push(name);
		if (i == authors.length - 1) {
			return a;
		}
	}
}

function parseDesrciption(des) {
	if (typeof des == 'object') {
		des = des.value;
	}
	let sourceI = des ? des.indexOf('([source]') : -1;
	if (sourceI != -1) {
		des = des.slice(0, sourceI);
	}
	return des;
}
