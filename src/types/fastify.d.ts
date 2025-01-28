import "@fastify/jwt";

declare module "@fastify/jwt" {
    interface FastifyJWT {
        user: { id: number; email: string; roles: string[] };
    }
}
