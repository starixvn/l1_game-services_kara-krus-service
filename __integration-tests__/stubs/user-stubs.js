import { userInfos as UserInfoModel, users as UserModel, userSessions as UserSessionModel } from "sc-base-database";

export const createDummyUser = async (memberId, memberName, currency) => {
    const user = await createUserRecord(memberId, memberName, currency);
    const userInfo = await createUserInfoRecord(user);
    const userSession = await createUserSessionRecord(user);

    return {
        user,
        userInfo,
        userSession,
    };
};

const createUserRecord = async (memberId, memberName, currency) => {
    const user = {
        local: {
            username: `${memberId}_${memberName}`,
            password: "dummy-password",
            lastDate: new Date(),
            lastLogin: new Date(),
            regDate: new Date(),
            clientId: "dummy-client-id",
            memberId: memberId,
            memberName: memberName,
            currency: currency,
        },
    };

    return UserModel.findOneAndUpdate({ "local.memberId": memberId }, user, {
        new: true,
        upsert: true,
    });
};

const createUserInfoRecord = async (user) => {
    const userInfo = {
        id: user.id,
        name: user.local.memberName,
        UID: user.local.memberId,
        red: 20000,
        avatarId: 1,
        currency: user.local.currency,
        minBet: 10,
        maxBet: 10000,
    };

    return UserInfoModel.findOneAndUpdate({ id: user.id }, userInfo, {
        new: true,
        upsert: true,
    });
};

const createUserSessionRecord = async (user) => {
    const userSession = {
        ssoToken: `${user.local.memberId}-sso-token`,
        sessionId: `${user.local.memberId}-session-id`,
        siteId: "111",
        userId: user.id,
        username: user.local.username,
        owSeq: "1,1,1w",
        memberId: user.local.memberId,
        ssoTime: new Date(),
        recheckInTime: new Date(),
        ip: "192.168.1.1",
        browserUserAgent: "browser-user-agent",
        language: "en-US",
        currency: user.local.currency,
        clientId: user.local.clientId,
        memberName: user.local.memberName,
        siteName: "site-name",
        system: 1,
    };

    return UserSessionModel.findOneAndUpdate({ userId: user.id }, userSession, {
        new: true,
        upsert: true,
    });
};
