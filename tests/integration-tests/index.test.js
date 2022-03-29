import { startServiceProcess, startSetupDataProcess } from "./stubs/test-jobs";
import { signinTest } from "./sign-in.test";
import { ingameTest } from "./in-game.test";

let processStartService;
const JEST_ASSERT_WAITING_RESPONSE_TIMEOUT = 30000;

beforeAll((done) => {
    jest.setTimeout(JEST_ASSERT_WAITING_RESPONSE_TIMEOUT);
    startSetupDataProcess(() => {
        processStartService = startServiceProcess(() => {
            console.log("start tests");
            done();
        });
    });
});

afterAll(() => {
    processStartService.stdin.pause();
    processStartService.kill();
});

signinTest();
ingameTest();
