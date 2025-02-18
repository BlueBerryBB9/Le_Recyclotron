import request from "supertest";
import { describe, expect, it, beforeAll, afterAll } from "@jest/globals";
import { startServer, startServerTest } from "../src/index.js";
import sequelize from "../src/config/database.js";
import { InputEvent } from "../src/models/Event.js";

import { FastifyBaseLogger, FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { Server, IncomingMessage, ServerResponse } from "http";

let app: FastifyInstance<
    Server,
    IncomingMessage,
    ServerResponse,
    FastifyBaseLogger,
    ZodTypeProvider
>;

beforeAll(async () => {
    // Démarrez le serveur
    app = await startServerTest();

    // Synchronisez la base de données
    await sequelize.sync({ force: true });
});



describe("event Routes", async () => {
    let eventId: number;

    it("should create a new event", async () => {
        const response = await request(app.server)
            .post("/event")
            .send({
                title: "Perils of Pauline",
                desc: "perils",
                date: new Date("2025-12-12T10:00:00Z"),
            } as InputEvent);

        expect(response.status).toBe(201);
        expect(response.body).toStrictEqual({
            title: "Perils of Pauline",
            desc: "perils",
            date: "2025-12-12T10:00:00Z",
        });
        eventId = response.body.id;
    });

    // it("should get all categories", async () => {
    //     const response = await request(app).get("/event");

    //     expect(response.status).toBe(200);
    //     expect(response.body.length).toBeGreaterThan(0);
    // });

    // it("should get a event by ID", async () => {
    //     const response = await request(app).get(`/event/${eventId}`);

    //     expect(response.status).toBe(200);
    //     expect(response.body.id).toBe(eventId);
    // });

    // it("should update a event", async () => {
    //     const response = await request(app)
    //         .put(`/event/${eventId}`)
    //         .send({ name: "Updated Electronics" });

    //     expect(response.status).toBe(200);
    //     expect(response.body.name).toBe("Updated Electronics");
    // });

    // it("should delete a event", async () => {
    //     const response = await request(app).delete(`/event/${eventId}`);

    //     expect(response.status).toBe(204);
    // });

    // it("should return 404 for a non-existing event", async () => {
    //     const response = await request(app).get(`/event/9999`);

    //     expect(response.status).toBe(404);
    // });
    app.close();
});

afterAll(async () => {
    // Fermez le serveur
    await app.close();

    // Fermez la base de données
    await sequelize.close();
});
