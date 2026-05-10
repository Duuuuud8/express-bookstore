process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
// const Book = require("../models/book");

let testBook;

beforeEach(async function() {
    const result = await db.query(`
        INSERT INTO books
            ("isbn",
            "amazon_url",
            "author",
            "language",
            "pages",
            "publisher",
            "title",
            "year")
        VALUES 
            ('0691161518',
            'http://a.co/eobPtX2',
            'Matthew Lane',
            'english',
            264,
            'Princeton University Press',
            'Power-Up',
            2017)
        RETURNING 
            isbn, 
            amazon_url, 
            author, 
            language,
            pages, 
            publisher,
            title, 
            year
    `);

    testBook = result.rows[0];
});

afterEach(async function() {
    await db.query("DELETE FROM books");
});

afterAll(async function() {
    await db.end();
});

describe("GET /books", function() {
    test("GET list of books", async function() {
        const resp = await request(app).get("/books");

        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            books: [testBook]
        });
    });
});

describe("GET /books/:isbn", function() {
    test("GET book by ISBN", async function() {
        const resp = await request(app).get(`/books/${testBook.isbn}`);

        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            book: testBook
        });
    });

    test("Responds with 404 for invalid isbn", async function() {
        const resp = await request(app).get("/books/doesnotexist");

        expect(resp.statusCode).toBe(404);
    });
});

describe("POST /books", function() {
    test("Creates a new book", async function() {
        const resp = await request(app)
                        .post("/books")
                        .send({
                            isbn: "1234567890",
                            amazon_url: "http://amazon.com",
                            author: "Josh",
                            language: "english",
                            pages: 300,
                            publisher: "Me",
                            title: "Testing Books",
                            year: 2026
                        });
        
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({
            book: {
                isbn: "1234567890",
                amazon_url: "http://amazon.com",
                author: "Josh",
                language: "english",
                pages: 300,
                publisher: "Me",
                title: "Testing Books",
                year: 2026
            }
        });
    });

    test("Rejects invalid book input", async function() {
        const resp = await request(app)
                        .post("/books")
                        .send({
                            isbn: "123",
                            pages: -5
                        });
        expect(resp.statusCode).toBe(400);
    });
});


describe("DELETE /books/:isbn", function() {
    test("Deletes a book by isbn", async function() {
        const resp = await request(app).delete(`/books/${testBook.isbn}`);

        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            message: "Book deleted"
        });
    });

    test("Responds with 404 for invalid isbn", async function() {
        const resp = await request(app).delete("/books/doesnotexist");

        expect(resp.statusCode).toBe(404);
    });
});


describe("PUT /books/:isbn", function() {
    test("Update book data", async function() {
        const resp = await request(app)
                        .put(`/books/${testBook.isbn}`)
                        .send({
                            isbn: "0691161518",
                            amazon_url: "http://updated.com",
                            author: "Updated Author",
                            language: "english",
                            pages: 500,
                            publisher: "Updated Publisher",
                            title: "Updated Title",
                            year: 2026
                        });

        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            book: {
                isbn: "0691161518",
                amazon_url: "http://updated.com",
                author: "Updated Author",
                language: "english",
                pages: 500,
                publisher: "Updated Publisher",
                title: "Updated Title",
                year: 2026
            }
        });
    });

    test("Responds with 404 for invalid isbn", async function() {
        const resp = await request(app)
                        .put("/books/doesnotexist")
                        .send({
                            isbn: "0691161518",
                            amazon_url: "http://updated.com",
                            author: "Updated Author",
                            language: "english",
                            pages: 500,
                            publisher: "Updated Publisher",
                            title: "Updated Title",
                            year: 2026
                        });

        expect(resp.statusCode).toBe(404);
    });

    test("Rejects invalid update data", async function() {
        const resp = await request(app)
                        .put(`/books/${testBook.isbn}`)
                        .send({
                            isbn: "6438435343488",
                            pages: -420
                        });
        
        expect(resp.statusCode).toBe(400);
    });
});

describe("PATCH /books/:isbn", function() {
    test("Edit part of book data", async function() {
        const resp = await request(app)
                        .patch(`/books/${testBook.isbn}`)
                        .send({
                            title: "Patched Title"
                        });

        expect(resp.statusCode).toBe(200);
        expect(resp.body.book.title).toBe("Patched Title");
    });

    test("Rejects invalid patch data", async function() {
        const resp = await request(app)
                        .patch(`/books/:isbn`)
                        .send({
                            pages: -200
                        });

        expect(resp.statusCode).toBe(400);
    });
});