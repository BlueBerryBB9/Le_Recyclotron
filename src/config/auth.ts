import jwt from "jsonwebtoken";

export const JWT_SECRET =
    process.env.JWT_SECRET ||
    "5481b2eae4f05586ad60f7a9c5d916439dceb735f72d45d7b856c2da066395c4200803d59925ecf0a1a2a222b2a9398cf243faa3a48c261c205f7194e761f0e9292bce137c1ba20835eeee73ab27129d4f0b0dcac43bf4e3cbf1dfacc7139689afdac657eec8fa185ece13d7002bfa258a47f2dc0d3eaeaf55a4006c54a51b778f12b2e89c68bac16f40dc4c988abab6a792302e090b6419c921b1414af3acdd5e226f5f80c14ef801e307166392ab13ccb66c7cad06bded4c839b481c28d05e658d0823b3ffff8c8c22bae14115e69a7268df3dbcdcfe536efbf2d248be5bc029ab7045dd23baf36e6b3b25fe5adbec3c8911fdedc8add2dbc210a29dede3e8";
export const JWT_EXPIRES_IN = "2h";

export const generateToken = (user: {
    id: number;
    email: string;
    roles: any[];
}) => {
    return jwt.sign(
        {
            id: user.id,
            roles: user.roles.map((role) => role.name),
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN },
    );
};
