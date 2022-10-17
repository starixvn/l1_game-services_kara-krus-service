import { spawn } from "child_process";

export const startSetupDataProcess = (processId, overrideConfigs, onSetupDataDone) => {
    const setupDataProcess = spawn("node", [
        "--es-module-specifier-resolution=node",
        "./tests/integration-tests/_stubs/test-data-setup.js",
        "-pid",
        `${processId}`,
        `${JSON.stringify(overrideConfigs)}`,
    ]);

    setupDataProcess.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
    });

    setupDataProcess.stderr.on("data", (data) => {
        console.log(`stderr: ${data}`);
    });

    setupDataProcess.on("close", (code) => {
        onSetupDataDone && onSetupDataDone();
        console.log(`child process exited with code ${code}`);
    });

    return setupDataProcess;
};

export const startServiceProcess = (processId, overrideConfigs, onServiceStarted) => {
    const serviceProcess = spawn("node", [
        "--es-module-specifier-resolution=node",
        "./tests/integration-tests/_stubs/game-service-app.js",
        "-pid",
        `${processId}`,
        `${JSON.stringify(overrideConfigs)}`,
        {
            stdio: ["pipe", "pipe", "pipe", "ipc"],
        },
    ]);

    serviceProcess.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);

        if (data && data.includes("Express server started and running on")) {
            onServiceStarted && onServiceStarted();
        }
    });

    serviceProcess.stderr.on("data", (data) => {
        console.log(`stderr: ${data}`);
    });

    return serviceProcess;
};

export const startService = (processId, overrideConfigs = {}) => {
    let processStartService;
    const JEST_ASSERT_WAITING_RESPONSE_TIMEOUT = 50000;
    beforeAll((done) => {
        jest.setTimeout(JEST_ASSERT_WAITING_RESPONSE_TIMEOUT);
        startSetupDataProcess(processId, overrideConfigs, () => {
            console.log("done setup db");
            processStartService = startServiceProcess(processId, overrideConfigs, () => {
                console.log("start tests");
                done();
            });
        });
    });

    afterAll(() => {
        processStartService.stdin.pause();
        processStartService.kill();
    });
};
