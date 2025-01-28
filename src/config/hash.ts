import * as argon from "argon2";

export const argon2Options = {
    type: argon.argon2id, // Use argon2id variant
    memoryCost: 19 * 1024, // 19 MiB of memory
    timeCost: 2, // 3 iterations
    parallelism: 1, // Single-threaded
    hashLength: 32, // 32 bytes (256 bits) output
};
