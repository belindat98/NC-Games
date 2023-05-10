const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const request = require("supertest");
const fs = require("fs/promises");
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

describe("/api", () => {
  describe("GET", () => {
    test("returns JSON describing all available endpoints on API", () => {
      return request(app)
        .get("/api")
        .then(({ body }) => {
          return Promise.all([
            body,
            fs.readFile(`${__dirname}/../endpoints.json`, "utf8"),
          ]);
        })
        .then(([body, endpoints]) => {
          expect(body).toEqual(JSON.parse(endpoints));
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
          expect(body.review).toMatchObject({
            title: expect.any(String),
            review_body: expect.any(String),
            designer: expect.any(String),
            review_img_url: expect.any(String),
            votes: expect.any(Number),
            category: expect.any(String),
            owner: expect.any(String),
            created_at: expect.any(String),
          });
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

describe("/api/reviews", () => {
  describe("GET", () => {
    test("responds with array of review objects with correct properties and status 200", () => {
      return request(app)
        .get("/api/reviews")
        .expect(200)
        .then(({ body }) => {
          expect(body.reviews.length).toBe(13);
          body.reviews.forEach((review) => {
            expect(review).toMatchObject({
              owner: expect.any(String),
              title: expect.any(String),
              review_id: expect.any(Number),
              category: expect.any(String),
              review_img_url: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              designer: expect.any(String),
              comment_count: expect.any(String)
            });
            expect(review).not.toHaveProperty("review_body")
          });
        });
    });
    test("reviews are sorted by date in descending order", () => {
      return request(app)
        .get("/api/reviews")
        .expect(200)
        .then(({ body }) => {
          expect(body.reviews).toBeSortedBy("created_at", {descending: true})
        })
    })
  });
});
