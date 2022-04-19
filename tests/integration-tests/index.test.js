import { startServiceProcess, startSetupDataProcess } from "./stubs/test-jobs";
import { signinTest } from "./sign-in.test";
import { ingameTest } from "./in-game.test";
import { getHistoryTest } from "./get-history.test";
import { placeBetTest } from "./place-bet.test";
import { settleTest } from "./settle.test";

let processStartService;
const JEST_ASSERT_WAITING_RESPONSE_TIMEOUT = 120000;

beforeAll((done) => {
    jest.setTimeout(JEST_ASSERT_WAITING_RESPONSE_TIMEOUT);
    startSetupDataProcess(() => {
        console.log("done setup db");
        processStartService = startServiceProcess(() => {
            setTimeout(() => {
                console.log("start tests");
                done();
            }, 15000);
        });
    });
});

afterAll(() => {
    processStartService.stdin.pause();
    processStartService.kill();
});

signinTest();
ingameTest();
getHistoryTest();
placeBetTest();
settleTest();
