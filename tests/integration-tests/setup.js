import dockerCompose from "docker-compose";
import path from "path";

import { createTestData } from "./stubs/test-data-setup";

export const setup = async () => {
    console.time("setup");

    await dockerCompose.upOne("mongo", { cwd: path.join(__dirname), log: true });

    await createTestData();

    await dockerCompose.upOne("app", { cwd: path.join(__dirname), log: true });

    console.timeEnd("setup");
};
