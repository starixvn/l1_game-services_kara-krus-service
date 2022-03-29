import { spawn } from "child_process";

//export function startService() {
const setupTestDataJob = spawn("node", ["--es-module-specifier-resolution=node", "./tests/integration-tests/stubs/test-data-setup.js"]);
setupTestDataJob.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
});

setupTestDataJob.stderr.on("data", (data) => {
    console.log(`stderr: ${data}`);
});
setupTestDataJob.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
});

const processStartService = spawn("node", [
    "--es-module-specifier-resolution=node",
    "./tests/integration-tests/game-service-setup/game-service-app.js",
    {
        stdio: [null, null, null, "ipc"],
    },
]);

processStartService.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
});

processStartService.stderr.on("data", (data) => {
    console.log(`stderr: ${data}`);
});
//}
