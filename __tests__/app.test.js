const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const request = require("supertest");
const { app } = require("../app");
const {
  categoryData,
  commentData,
  reviewData,
  userData,
} = require("../db/data/test-data/index");

beforeEach(() => seed({ categoryData, commentData, reviewData, userData }));
afterAll(() => db.end());

describe("GET", () => {
  test("If filepath is invalid, returns 404 not found", () => {
    return request(app).get("/hello").expect(404);
  });
});

describe("/api/categories", () => {
  describe("GET", () => {
    test("responds with an array of category objects and 200 status", () => {
      return request(app)
        .get("/api/categories")
        .expect(200)
        .then(({ body }) => {
          expect(body.categories.length).toBe(4);
        });
    });
    test("category objects have expected properties", () => {
      return request(app)
        .get("/api/categories")
        .expect(200)
        .then(({ body }) => {
          body.categories.forEach(category => {
            expect(typeof category.slug).toBe("string");
            expect(typeof category.description).toBe(
              "string"
            );
          })
        });
    });
  });
});
