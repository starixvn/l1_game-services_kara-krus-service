import { startServiceProcess, startSetupDataProcess } from "./stubs/test-jobs";

startSetupDataProcess(() => {
    console.log("done setup db");
    startServiceProcess(() => {
        console.log("start run service");
    }, true);
});
