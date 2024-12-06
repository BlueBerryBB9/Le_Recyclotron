import * as c from "../src/models/Category.js";
import { DataTypes, Model } from "sequelize";
import sequelize from "../src/config/database.js";
import * as ctrl from "../src/controllers/categoryController.js";
import { describe, expect, test, beforeAll, afterAll, jest } from "@jest/globals";
import { app } from "../src/index.js";

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    await sequelize.close();
});

describe("Category tests", () => {
    test("should create a new category", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/categories",
            payload: { name: "Test Category" },
        });
        expect(response.statusCode).toBe(201);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.name).toBe("Test Category");
    });

    test("should fetch all categories", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/categories",
        });
        expect(response.statusCode).toBe(200);
        const responseBody = JSON.parse(response.body);
        expect(Array.isArray(responseBody)).toBe(true);
    });

    test("should fetch a category by ID", async () => {
        const category = await c.default.create({ name: "Fetch Category" });
        const response = await app.inject({
            method: "GET",
            url: `/categories/${category.id}`,
        });
        expect(response.statusCode).toBe(200);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.name).toBe("Fetch Category");
    });

    test("should update a category", async () => {
        const category = await c.default.create({ name: "Update Category" });
        const response = await app.inject({
            method: "PUT",
            url: `/categories/${category.id}`,
            payload: { name: "Updated Category" },
        });
        expect(response.statusCode).toBe(200);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.name).toBe("Updated Category");
    });

    test("should delete a category", async () => {
        const category = await c.default.create({ name: "Delete Category" });
        const response = await app.inject({
            method: "DELETE",
            url: `/categories/${category.id}`,
        });
        expect(response.statusCode).toBe(204);
    });

    test("should return 404 for non-existent category", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/categories/9999",
        });
        expect(response.statusCode).toBe(404);
    });

    test("should return 400 for invalid category data", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/categories",
            payload: { name: "" },
        });
        expect(response.statusCode).toBe(400);
    });

    test("should handle server errors gracefully", async () => {
        jest.spyOn(c.default, "create").mockImplementation(() => {
            throw new Error("Server error");
        });
        const response = await app.inject({
            method: "POST",
            url: "/categories",
            payload: { name: "Error Category" },
        });
        expect(response.statusCode).toBe(500);
        jest.restoreAllMocks();
    });

    test("should fetch categories with children", async () => {
        const parentCategory = await c.default.create({ name: "Parent Category" });
        await c.default.create({ name: "Child Category", parent_category_id: parentCategory.id });
        const response = await app.inject({
            method: "GET",
            url: `/categories/${parentCategory.id}/children`,
        });
        expect(response.statusCode).toBe(200);
        const responseBody = JSON.parse(response.body);
        expect(Array.isArray(responseBody)).toBe(true);
        expect(responseBody.length).toBe(1);
        expect(responseBody[0].name).toBe("Child Category");
    });

    test("should fetch parent category", async () => {
        const parentCategory = await c.default.create({ name: "Parent Category" });
        const childCategory = await c.default.create({ name: "Child Category", parent_category_id: parentCategory.id });
        const response = await app.inject({
            method: "GET",
            url: `/categories/${childCategory.id}/parent`,
        });
        expect(response.statusCode).toBe(200);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.name).toBe("Parent Category");
    });
});
        const category = await c.default.create({ name: "Fetch Category" });
        const response = await request(app).get(`/categories/${category.id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe("Fetch Category");
    });

    test("should update a category", async () => {
        const category = await c.default.create({ name: "Update Category" });
        const response = await request(app)
            .put(`/categories/${category.id}`)
            .send({ name: "Updated Category" });
        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe("Updated Category");
    });

    test("should delete a category", async () => {
        const category = await c.default.create({ name: "Delete Category" });
        const response = await request(app).delete(`/categories/${category.id}`);
        expect(response.statusCode).toBe(204);
    });

    test("should return 404 for non-existent category", async () => {
        const response = await request(app).get("/categories/9999");
        expect(response.statusCode).toBe(404);
    });

    test("should return 400 for invalid category data", async () => {
        const response = await request(app)
            .post("/categories")
            .send({ name: "" });
        expect(response.statusCode).toBe(400);
    });

    test("should handle server errors gracefully", async () => {
        jest.spyOn(c.default, "create").mockImplementation(() => {
            throw new Error("Server error");
        });
        const response = await request(app)
            .post("/categories")
            .send({ name: "Error Category" });
        expect(response.statusCode).toBe(500);
        jest.restoreAllMocks();
    });

    test("should fetch categories with children", async () => {
        const parentCategory = await c.default.create({ name: "Parent Category" });
        await c.default.create({ name: "Child Category", parent_category_id: parentCategory.id });
        const response = await request(app).get(`/categories/${parentCategory.id}/children`);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
        expect(response.body[0].name).toBe("Child Category");
    });

    test("should fetch parent category", async () => {
        const parentCategory = await c.default.create({ name: "Parent Category" });
        const childCategory = await c.default.create({ name: "Child Category", parent_category_id: parentCategory.id });
        const response = await request(app).get(`/categories/${childCategory.id}/parent`);
        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe("Parent Category");
    });
});