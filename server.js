import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import {
	graphql,
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLID,
	GraphQLFloat,
	GraphQLNonNull,
	GraphQLList,
	GraphQLInt,
	GraphQLBoolean
} from 'graphql'

const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(':memory:')

// Add test data
db.serialize(() => {
	db.run("CREATE TABLE authors (id INT, name TEXT)")
	const add_authors_stmt = db.prepare("INSERT INTO authors VALUES (?, ?)")
	add_authors_stmt.run(1, "John Doe")
	add_authors_stmt.run(2, "Kate Johnson")
	add_authors_stmt.run(3, "Scott Adams")
	add_authors_stmt.run(4, "Emily Smith")
	add_authors_stmt.finalize()

	db.run("CREATE TABLE books (id INT, title TEXT, author_id INT, year INT)")
	const add_books_stmt = db.prepare("INSERT INTO books VALUES (?, ?, ?, ?)")
	add_books_stmt.run(1, "The Hitchhiker's Guide to the Galaxy", 1, 2001)
	add_books_stmt.run(2, "The Restaurant at the End of the Universe", 2, 1995)
	add_books_stmt.run(3, "Life, the Universe and Everything", 1, 1980)
	add_books_stmt.run(4, "So Long, and Thanks for All the Fish", 3, 2010)
	add_books_stmt.finalize()
})

const authorSchema = new GraphQLObjectType({
	name: 'Author',
	description: 'An author',
	fields: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		name: { type: new GraphQLNonNull(GraphQLString) },
	}
})

const bookSchema = new GraphQLObjectType({
	name: 'Book',
	description: 'A book',
	fields: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		title: { type: new GraphQLNonNull(GraphQLString) },
		year: { type: GraphQLInt },
		author: {
			type: authorSchema,
			resolve: (book) => {
				// console.log('--> get author of the book', book)
				return new Promise((resolve, reject) => {
					db.get("SELECT * FROM authors WHERE id = ?", [book.author_id], (err, row) => {
						resolve({
							id: row.id,
							name: row.name
						})
					})
				})
			}
		}
	}
})

const actionSchema = new GraphQLObjectType({
	name: 'ActionResult',
	description: 'Action Result',
	fields: {
		success: { type: GraphQLBoolean },
	}
})

const QueryRoot = new GraphQLObjectType({
	name: 'Query',
	fields: () => ({
		author: {
			type: authorSchema,
			args: {
				id: { type: GraphQLID }
			},
			resolve: (root, args) => {
				// console.log('--> args', args)
				return new Promise((resolve, reject) => {
					db.get("SELECT * FROM authors WHERE id = ?", [args.id], (err, row) => {
						resolve({
							id: args.id,
							name: row.name
						})
					})
				})
			}
		},
		authors: {
			type: new GraphQLList(authorSchema),
			resolve: (root, args) => {
				// console.log('--> args', args)
				return new Promise((resolve, reject) => {
					db.all("SELECT * FROM authors", (err, rows) => {
						resolve(rows)
					})
				})
			}
		},
		addAuthor: {
			type: authorSchema,
			args: {
				name: { type: new GraphQLNonNull(GraphQLString) },
			},
			resolve: (root, args) => {
				// console.log('--> args', args)
				return new Promise((resolve, reject) => {
					const newId = Math.floor(+new Date() / 1000)
					db.run("INSERT INTO authors VALUES (?, ?)", [newId, args.name], (err) => {
						resolve({
							id: newId,
							name: args.name
						})
					})
				})
			}
		},
		updateAuthor: {
			type: actionSchema,
			args: {
				id: { type: new GraphQLNonNull(GraphQLInt) },
				name: { type: new GraphQLNonNull(GraphQLString) },
			},
			resolve: (root, args) => {
				// console.log('--> args', args)
				return new Promise((resolve, reject) => {
					db.run("UPDATE authors SET name = ? WHERE id = ?", [args.name, args.id], (err) => {
						resolve({
							success: true
						})
					})
				})
			}
		},
		deleteAuthor: {
			type: actionSchema,
			args: {
				id: { type: new GraphQLNonNull(GraphQLInt) },
			},
			resolve: (root, args) => {
				// console.log('--> args', args)
				return new Promise((resolve, reject) => {
					db.run("DELETE FROM authors WHERE id = ?", [args.id], (err) => {
						resolve({
							success: true
						})
					})
				})
			}
		},
		book: {
			type: bookSchema,
			args: {
				id: { type: GraphQLID }
			},
			resolve: (root, args) => {
				// console.log('--> args', args)
				return new Promise((resolve, reject) => {
					db.get("SELECT * FROM books WHERE id = ?", [args.id], (err, row) => {
						resolve({
							id: args.id,
							title: row.title,
							author_id: row.author_id,
							year: row.year
						})
					})
				})
			}
		},
	})
})

const schema = new GraphQLSchema({ query: QueryRoot })

const app = express()

app.use('/api', graphqlHTTP({
	schema: schema,
	graphiql: true,
}))

app.listen(4000, () => {
	console.log('Running a GraphQL API server at http://localhost:4000/api')
})
