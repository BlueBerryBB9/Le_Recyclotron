import request from "supertest";
import { describe, expect, it, beforeAll, afterAll } from "@jest/globals";
import { startServerTest } from "../src/index"; // Adjust the path to your app file
import sequelize from "../src/config/database";
import Category from "../src/models/Category";

describe("Category Routes", () => {
    let categoryId: number;

    it("should create a new category", async () => {
        const response = await request(app)
            .post("/categories")
            .send({ name: "Electronics" });

        expect(response.status).toBe(201);
        expect(response.body.name).toBe("Electronics");
        expect(ZCategory.parse(response.body)).toBeInstanceOf(Category);
        categoryId = response.body.id;
    });

    it("should get all categories", async () => {
        const response = await request(app).get("/categories");

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it("should get a category by ID", async () => {
        const response = await request(app).get(`/categories/${categoryId}`);

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(categoryId);
    });

    it("should update a category", async () => {
        const response = await request(app)
            .put(`/categories/${categoryId}`)
            .send({ name: "Updated Electronics" });

        expect(response.status).toBe(200);
        expect(response.body.name).toBe("Updated Electronics");
    });

    it("should delete a category", async () => {
        const response = await request(app).delete(`/categories/${categoryId}`);

        expect(response.status).toBe(204);
    });

    it("should return 404 for a non-existing category", async () => {
        const response = await request(app).get(`/categories/9999`);

        expect(response.status).toBe(404);
    });
});
