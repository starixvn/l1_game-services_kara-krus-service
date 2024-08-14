import { boostedOddsTest } from "./boosted-odds.test";
import { getHistoryTest } from "./get-history.test";
import { ingameTest } from "./in-game.test";
import { placeBetTest } from "./place-bet.test";
import { settleTest } from "./settle.test";
import { signinTest } from "./sign-in.test";
import { startServiceProcess, startSetupDataProcess } from "./stubs/test-jobs";

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
boostedOddsTest();
ingameTest();
getHistoryTest();
placeBetTest();
settleTest();
