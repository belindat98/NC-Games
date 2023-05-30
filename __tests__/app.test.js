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
  describe("PATCH", () => {
    test("when passed a body with inc_votes property, increments the votes on the given review by that much and returns the updated review", () => {
      return request(app)
        .patch("/api/reviews/1")
        .send({ inc_votes: 5 })
        .expect(200)
        .then(({ body }) => {
          expect(body.review).toMatchObject({
            review_id: 1,
            title: expect.any(String),
            review_body: expect.any(String),
            designer: expect.any(String),
            review_img_url: expect.any(String),
            votes: 6,
            category: expect.any(String),
            owner: expect.any(String),
            created_at: expect.any(String),
          });
        });
    });
    test("if invalid review_id given, gives 400 error and returns error message", () => {
      return request(app)
        .patch("/api/reviews/hello")
        .send({ inc_votes: 5 })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid request!");
        });
    });
    test("if valid out of range review_id given, gives a 404 error and review not found message", () => {
      return request(app)
        .patch("/api/reviews/1000")
        .send({ inc_votes: 5 })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Resource does not exist in reviews");
        });
    });
    test("if inc_votes property not given, returns 400 status and error message", () => {
      return request(app)
        .patch("/api/reviews/1")
        .send({ a: "b" })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("missing required key");
        });
    });
    test("if passed additional keys, ignores", () => {
      return request(app)
        .patch("/api/reviews/1")
        .send({ inc_votes: 5, title: "bananas", apples: "pears", owner: "me" })
        .expect(200)
        .then(({ body }) => {
          expect(body.review).toMatchObject({
            review_id: 1,
            title: expect.not.stringMatching("bananas"),
            review_body: expect.any(String),
            designer: expect.any(String),
            review_img_url: expect.any(String),
            votes: 6,
            category: expect.any(String),
            owner: expect.not.stringMatching("me"),
            created_at: expect.any(String),
          });
          expect(body.review).not.toHaveProperty("apples");
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
              comment_count: expect.any(String),
            });
            expect(review).not.toHaveProperty("review_body");
          });
        });
    });
    test("reviews are sorted by date in descending order by default", () => {
      return request(app)
        .get("/api/reviews")
        .expect(200)
        .then(({ body }) => {
          expect(body.reviews).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("reviews can be selected by category", () =>{
      return request(app)
      .get("/api/reviews?category=social deduction")
      .expect(200)
      .then(({body}) => {
        expect(body.reviews.length).toBe(11)
        body.reviews.forEach(review => {
          expect(review.category).toBe("social deduction")
        })
      })
    })
    test("if valid category given but there are no reviews for that category, returns an empty array", () =>{
      return request(app)
      .get("/api/reviews?category=children's games")
      .expect(200)
      .then(({body}) => {
        expect(body).toEqual({reviews: []})
      })
    })
    })
    test("reviews can be sorted by any valid column", () => {
      return request(app)
        .get("/api/reviews?sort_by=votes")
        .expect(200)
        .then(({ body }) => {
          expect(body.reviews).toBeSortedBy("votes", {descending: true });
        });
    });
    test("if invalid sort column given, returns 400 error and error message", () => {
      return request(app)
        .get("/api/reviews?sort_by=hello")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid sort query");
        });
    });
    test("if sort order is given, will sort accordingly", () => {
      return request(app)
        .get("/api/reviews?sort_by=votes&order=ASC")
        .expect(200)
        .then(({ body }) => {
          expect(body.reviews).toBeSortedBy("votes");
        });
    });
    test("if invalid sort order given, returns 400 error and error message", () => {
      return request(app)
        .get("/api/reviews?order=hello")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid sort order");
        });
    });
  });

describe("/api/reviews/:review_id/comments", () => {
  describe("GET", () => {
    test("responds with an array of comments and 200 status for given review_id and each comment has correct properties", () => {
      return request(app)
        .get("/api/reviews/2/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments.length).toBe(3);
          body.comments.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              review_id: 2,
            });
          });
        });
    });
    test("reviews are sorted by date in descending order", () => {
      return request(app)
        .get("/api/reviews/2/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });
    test("if invalid review_id given, gives 400 error and returns error message", () => {
      return request(app)
        .get("/api/reviews/hello/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid request!");
        });
    });
    test("if valid out of range review_id given, gives a 404 error and review not found message", () => {
      return request(app)
        .get("/api/reviews/10000/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Resource does not exist in reviews");
        });
    });
    test("if valid review_id given but there are no comments for that id, returns 200 status with empty array", () => {
      return request(app)
        .get("/api/reviews/1/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({ comments: [] });
        });
    });
  });
  describe("POST", () => {
    test("when passed a valid body, returns 201 status and the newly posted comment, and adds comment to the database", () => {
      return request(app)
        .post("/api/reviews/5/comments")
        .send({ username: "mallionaire", body: "wow great!" })
        .expect(201)
        .then(({ body }) => {
          expect(body.comment).toMatchObject({
            comment_id: expect.any(Number),
            body: "wow great!",
            review_id: 5,
            author: "mallionaire",
            votes: 0,
            created_at: expect.any(String),
          });
        });
    });
    test("if invalid review_id given, gives 400 error and returns error message", () => {
      return request(app)
        .post("/api/reviews/hello/comments")
        .send({ username: "mallionaire", body: "hello" })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid request!");
        });
    });
    test("if valid out of range review_id given, gives a 404 error and review not found message", () => {
      return request(app)
        .post("/api/reviews/1000/comments")
        .send({ username: "mallionaire", body: "hello" })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Resource does not exist in reviews");
        });
    });
    test("if given an invalid username, returns 400 status with error message", () => {
      return request(app)
        .post("/api/reviews/1/comments")
        .send({ username: "me", body: "hello" })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            'Key (author)=(me) is not present in table "users".'
          );
        });
    });
    test("if not passed a username or body, will return 400 error", () => {
      return request(app)
        .post("/api/reviews/1/comments")
        .send({ body: "hello" })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("missing required key");
        });
    });
    test("if passed additional invalid keys, ignores", () => {
      return request(app)
        .post("/api/reviews/1/comments")
        .send({ body: "hello", username: "mallionaire", bananas: "oranges" })
        .expect(201)
        .then(({ body }) => {
          expect(body.comment).toMatchObject({
            comment_id: expect.any(Number),
            body: "hello",
            review_id: 1,
            author: "mallionaire",
            votes: 0,
            created_at: expect.any(String),
          });
          expect(body.comment).not.toHaveProperty("bananas");
        });
    });
    test("if passed additional valid keys, ignores", () => {
      return request(app)
        .post("/api/reviews/1/comments")
        .send({
          body: "hello",
          username: "mallionaire",
          review_id: 2,
          votes: 5,
        })
        .expect(201)
        .then(({ body }) => {
          expect(body.comment).toMatchObject({
            comment_id: expect.any(Number),
            body: "hello",
            review_id: 1,
            author: "mallionaire",
            votes: 0,
            created_at: expect.any(String),
          });
        });
    });
  });
});

describe("/api/users", () => {
  describe("GET", () => {
    test("returns an array of the users with correct properties, and 200 status", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          expect(body.users.length).toBe(4);
          body.users.forEach((user) => {
            expect(user).toMatchObject({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            });
          });
        });
    });
  });
});

describe("/api/comments/:comment_id", () => {
  describe("DELETE", () => {
    test("when given a valid comment_id deletes the comment and returns 204 status and no content", () => {
      return request(app)
        .delete("/api/comments/1")
        .expect(204)
        .then(({ body }) => {
          expect(body).toEqual({});
          return db.query(`SELECT * FROM comments WHERE comment_id = 1`);
        })
        .then(({ rows }) => {
          expect(rows.length).toBe(0);
        });
    });
    test("if invalid comment_id given, gives 400 error and returns error message", () => {
      return request(app)
        .delete("/api/comments/hello")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid request!");
        });
    });
    test("if valid out of range comment_id given, gives a 204 status", () => {
      return request(app)
        .delete("/api/comments/10000")
        .expect(204)
        .then(({ body }) => {
          expect(body).toEqual({});
        });
    });
  });
});
