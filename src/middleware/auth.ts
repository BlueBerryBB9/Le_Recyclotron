export const authenticate = async (
    request: { jwtVerify: () => any },
    reply: {
        status: (arg0: number) => {
            (): any;
            new (): any;
            send: {
                (arg0: { error: string; message: string }): void;
                new (): any;
            };
        };
    },
) => {
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.status(401).send({
            error: "Unauthorized",
            message: "Invalid or expired token",
        });
    }
};

export const authorize =
    (allowedRoles: any[]) =>
    async (
        request: { user: { roles: any } },
        reply: {
            status: (arg0: number) => {
                (): any;
                new (): any;
                send: {
                    (arg0: { error: string; message: string }): any;
                    new (): any;
                };
            };
        },
    ) => {
        const userRoles = request.user.roles;

        const hasPermission = allowedRoles.some((role) =>
            userRoles.includes(role),
        );

        if (!hasPermission) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "Insufficient permissions",
            });
        }
    };

export const isSelfOrAdmin = async (
    request: { params: { id: string }; user: { id: any; roles: any } },
    reply: {
        status: (arg0: number) => {
            (): any;
            new (): any;
            send: {
                (arg0: { error: string; message: string }): any;
                new (): any;
            };
        };
    },
) => {
    const userId = parseInt(request.params.id);
    const requestingUserId = request.user.id;
    const userRoles = request.user.roles;

    if (userId !== requestingUserId && !userRoles.includes("Admin")) {
        return reply.status(403).send({
            error: "Forbidden",
            message:
                "You can only modify your own profile unless you are an admin",
        });
    }
};
