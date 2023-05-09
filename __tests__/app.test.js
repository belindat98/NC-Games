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
  test("If filepath is invalid, returns 404 not found and error message", () => {
    return request(app)
      .get("/hello")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
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
          body.categories.forEach((category) => {
            expect(typeof category.slug).toBe("string");
            expect(typeof category.description).toBe("string");
          });
        });
    });
  });
});

describe("/api/reviews/:review_id", () => {
  describe("GET", () => {
    test("responds with review object with correct properties and status 200", () => {
      return request(app)
        .get("/api/reviews/1")
        .expect(200)
        .then(({ body }) => {
          expect(body.review.review_id).toBe(1);
          expect(body.review.title).toBe("Agricola");
          expect(body.review.review_body).toBe("Farmyard fun!");
          expect(body.review.designer).toBe("Uwe Rosenberg");
          expect(body.review.review_img_url).toBe(
            "https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=700&h=700"
          );
          expect(body.review.votes).toBe(1);
          expect(body.review.category).toBe("euro game");
          expect(body.review.owner).toBe("mallionaire");
          expect(body.review.created_at).toBe("2021-01-18T10:00:20.514Z");
        });
    });
    test("if invalid review_id given, gives 400 error and returns error message", () => {
      return request(app)
        .get("/api/reviews/hello")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid request!");
        });
    });
    test("if valid out of range review_id given, gives a 404 error and review not found message", () => {
      return request(app)
        .get("/api/reviews/10000")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("review not found!");
        });
    });
  });
});
