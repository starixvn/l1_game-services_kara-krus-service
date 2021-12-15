import awilix from "awilix";
import { endGame, getBalance, placeBet } from "sc-game-service-integration";

import SeDieContainerRegistry from "../../src/sedie-container-registry";

const { asValue } = awilix;

export class ContainerRegistry extends SeDieContainerRegistry {
    registerApis() {
        super.registerApis();

        this.container.register({
            endGame: asValue(endGame),
            getBalance: asValue(getBalance),
            placeBet: asValue(placeBet),
        });
    }
}
