import { gameConfigs as GameConfigModel } from "sc-base-database";

export const createGameConfig = async (gameConfig) => {
    const defaultGameConfig = {
        enabled: true,
        minbet: 1,
        maxbet: true,
        disabledround: 988976,
        botenabled: false,
        maxbot: 0,
        bot_maxbet: 1000000,
        bot_minbet: 1,
        hour_maxbot: [
            0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01,
            0.01, 0.01, 0.01,
        ],
        disabled_message: "This game is under maintenance11111, it will be back shortly to upgrade new version.",
        delayStartTime: 0,
    };

    const mergedGameConfig = { ...defaultGameConfig, ...gameConfig };

    return GameConfigModel.findOneAndUpdate({ name: mergedGameConfig.name }, mergedGameConfig, {
        new: true,
        upsert: true,
    });
};
