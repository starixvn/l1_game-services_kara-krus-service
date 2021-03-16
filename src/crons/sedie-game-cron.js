import { Table } from "sc-game-base";

export default class SedieGameCron extends Table.Crons.TableGameCron {
    isStartingTime(remainingTime, durations) {
        return remainingTime === durations.placingBets + durations.shakeThePlateDuration;
    }
}
