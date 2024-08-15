import { stub } from "jest-micro-auto-stub";
import { logger } from "sc-common";
jest.mock("sc-common");

import { InGameConsumer, PlaceBetConsumer, UserDisconnectConsumer, UserSignInConsumer } from "sc-game-base/src/core/event-consumers";
import { UserSignInPublisher } from "sc-game-base/src/core/event-publishers";
import GameData from "sc-game-base/src/core/game-data";
import GameDefinition from "sc-game-base/src/core/game-definition";
import { HistoryQuery, RoundQuery } from "sc-game-base/src/core/query-apis";
import { PlayGamePermissionValidator } from "sc-game-base/src/core/validators";
import GameResultServiceConsumer from "../../../src/consumers/game-result-service-consumer";
import SocketRouter from "../../../src/routers/socket-router";

describe("Socket router test", () => {
    const definition = new GameDefinition({ id: 1, name: "game name" });
    const gameData = new GameData(0);
    /** @type {UserSignInConsumer} */
    const userSignInConsumer = stub(UserSignInConsumer);
    /** @type {InGameConsumer} */
    const inGameConsumer = stub(InGameConsumer);
    /** @type {PlaceBetConsumer} */
    const placeBetConsumer = stub(PlaceBetConsumer);
    /** @type {UserDisconnectConsumer} */
    const userDisconnectConsumer = stub(UserDisconnectConsumer);
    /** @type {UserSignInPublisher} */
    const userSignInPublisher = stub(UserSignInPublisher);
    /** @type {HistoryQuery} */
    const historyQuery = stub(HistoryQuery);
    /** @type {logger} */
    const logService = stub(logger);

    const roundQuery = stub(RoundQuery);
    const gameResultServiceConsumer = stub(GameResultServiceConsumer);

    /** @type {PlayGamePermissionValidator} */
    const playGamePermissionValidator = stub(PlayGamePermissionValidator);

    const socketClient = {
        id: "socket1",
        on: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
    };

    gameData.realPlayers = {
        socket1: {
            session: {
                playerId: "player1",
                operatorId: "operator1",
                siteId: "site1",
            },
        },
    };

    const router = new SocketRouter({
        definition,
        gameData,
        userSignInConsumer,
        inGameConsumer,
        placeBetConsumer,
        userDisconnectConsumer,
        userSignInPublisher,
        historyQuery,
        logService,
        playGamePermissionValidator,
        roundQuery,
        gameResultServiceConsumer,
    });

    router.socketClient = socketClient;

    beforeEach(() => {
        jest.spyOn(logService, "logError");
        jest.spyOn(logService, "logWarning");
    });

    describe("init", () => {
        it("should binds socket events", () => {
            // act
            router.init(socketClient);

            // assert
            expect(socketClient.on).toHaveBeenCalledTimes(6);
        });

        it("should initialize socketClient with event betDetails", () => {
            // Act
            router.init(socketClient);

            // Assert
            expect(socketClient.on).toHaveBeenCalledWith("betDetails", expect.any(Function));
        });
    });

    describe("betDetails", () => {
        describe("when verify fails", () => {
            it("should not consume result service", () => {
                // Arrange
                const payload = {
                    roundId: 1,
                    mode: "dark",
                    language: "vi",
                    timeZoneOffset: 7,
                };
                jest.spyOn(router, "verify").mockReturnValue(false);

                // Act
                router.handleBetDetails(payload);

                // Assert
                expect(gameResultServiceConsumer.consume).not.toHaveBeenCalled();
            });
        });

        describe("when verify succeeds", () => {
            it("should consume result service", async () => {
                // Arrange
                const payload = {
                    roundId: 1,
                    mode: "dark",
                    language: "vi",
                    timeZoneOffset: 7,
                };
                jest.spyOn(router, "verify").mockReturnValue(true);
                const consumeSpy = jest.spyOn(gameResultServiceConsumer, "getUrl").mockResolvedValue({
                    isAuthenticated: true,
                    redirectUrl: "http://example.com",
                });

                // Act
                await router.handleBetDetails(payload);

                // Assert
                expect(consumeSpy).toHaveBeenCalledWith({
                    playerId: "player1",
                    operatorId: "operator1",
                    siteId: "site1",
                    roundId: 1,
                    mode: "dark",
                    timeZoneOffset: 7,
                    language: "vi",
                });
                
                expect(socketClient.emit).toHaveBeenCalledWith(router.definition.name, {
                    betDetailsUrl: "http://example.com",
                });
            });
        });
    });
});
