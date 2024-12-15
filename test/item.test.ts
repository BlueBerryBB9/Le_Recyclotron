// import * as e from "../src/models/Item.js";
// import { DataTypes, Model } from "sequelize";
// import sequelize from "../src/config/database.js";
// import { createItem } from "../src/controllers/itemController.js";
// import { describe, expect, test } from "@jest/globals";
// import axios from "axios";

// export async function test_item() {
//     await e.default.create({
//         name: "Item1",
//         statut: "test",
//         material: "materiel1",
//         image: "/imagetest",
//         date: new Date("2024-01-01"),
//     });
//     const item = await e.default.findAll();
//     console.log("Items créés:", JSON.stringify(item, null, 2));
// }
// describe("Item tests", () => {
//     test("should create a new item", async () => {
//         const aaa = axios.get("http://localhost:3000");
//         const response = await request(fastify)
//             .post("/items")
//             .send({ name: "Test Item" });
//         expect(response.statusCode).toBe(201);
//         expect(response.body.name).toBe("Test Item");
//     });

//     test("should fetch all items", async () => {
//         const response = await request(fastify).get("/items");
//         expect(response.statusCode).toBe(200);
//         expect(Array.isArray(response.body)).toBe(true);
//     });

//     test("should fetch a category by ID", async () => {
//         const category = await c.default.create({ name: "Fetch Item" });
//         const response = await request(fastify).get(`/items/${item.id}`);
//         expect(response.statusCode).toBe(200);
//         expect(response.body.name).toBe("Fetch Item");
//     });

//     test("should update a category", async () => {
//         const category = await c.default.create({ name: "Update Item" });
//         const response = await request(fastify)
//             .put(`/items/${item.id}`)
//             .send({ name: "Updated Item" });
//         expect(response.statusCode).toBe(200);
//         expect(response.body.name).toBe("Updated Item");
//     });

//     test("should delete a item", async () => {
//         const category = await c.default.create({ name: "Delete Category" });
//         const response = await request(fastify).delete(
//             `/categories/${category.id}`,
//         );
//         expect(response.statusCode).toBe(204);
//     });

//     test("should return 404 for non-existent category", async () => {
//         const response = await request(fastify).get("/categories/9999");
//         expect(response.statusCode).toBe(404);
//     });

//     test("should return 400 for invalid category data", async () => {
//         const response = await request(fastify)
//             .post("/categories")
//             .send({ name: "" });
//         expect(response.statusCode).toBe(400);
//     });

//     test("should handle server errors gracefully", async () => {
//         jest.spyOn(c.default, "create").mockImplementation(() => {
//             throw new Error("Server error");
//         });
//         const response = await request(fastify)
//             .post("/categories")
//             .send({ name: "Error Category" });
//         expect(response.statusCode).toBe(500);
//         jest.restoreAllMocks();
//     });
// });
