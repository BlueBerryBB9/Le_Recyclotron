// INFO: this config is REQUIRED to comply with nodeJS module resolving,
// most configs are suited to legacy resolving.
// source: https://dev.to/mangadev/set-up-a-backend-nodejs-typescript-jest-using-es-modules-1530

// INFO: deps: jest, ts-jest, ts-node (for loading this config)
import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
    verbose: true,
    transform: {
        "^.+\\.ts?$": [
            "ts-jest",
            {
                useESM: true,
            },
        ],
    },
    extensionsToTreatAsEsm: [".ts"],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
};

export default config;
