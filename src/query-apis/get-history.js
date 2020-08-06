import sedieBetLogs from '../models/sedie-betlogs.js';
import sedieRounds from '../models/sedie-rounds.js';

export default async (user, page, pageSize = 8) => {
    const pageIndex = page >> 0;
    if (pageIndex < 1 && !user) {
        return;
    }

    const filter = { uid: user.UID, thanhtoan: true };
    const numberOfSkippedBets = (pageIndex - 1) * pageSize;
    const total = await sedieBetLogs.countDocuments(filter).exec();
    const betProjection = {
        _id: false,
        uid: false,
        thanhtoan: false,
        siteId: false,
        memberId: false,
        __v: false,
        __archive: false,
    };
    const bets = await sedieBetLogs
        .find(filter, betProjection, {
            sort: { _id: -1 },
            skip: numberOfSkippedBets,
            limit: pageSize,
        })
        .lean()
        .exec();

    let betLogs = [];
    if (bets && bets.length) {
        betLogs = await Promise.all(
            bets.map(async (bet) => {
                const round = await sedieRounds
                    .findOne({ id: bet.phien }, { _id: false, red1: true, red2: true, red3: true, red4: true })
                    .lean()
                    .exec();

                return { ...bet, kq: [round.red1, round.red2, round.red3, round.red4] };
            })
        );
    }

    return { history: { data: betLogs, page: pageIndex, kmess: pageSize, total } };
};
