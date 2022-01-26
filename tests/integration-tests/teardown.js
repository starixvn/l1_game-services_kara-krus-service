import dockerCompose from "docker-compose";

export const teardown = async () => {
    await dockerCompose.down();
};
