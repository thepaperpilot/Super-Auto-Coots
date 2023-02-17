import Row from "components/layout/Row.vue";
import Spacer from "components/layout/Spacer.vue";
import { jsx } from "features/feature";
import type { BaseLayer, GenericLayer } from "game/layers";
import { createLayer } from "game/layers";
import type { Player } from "game/player";
import { computed, ref } from "vue";
import CharacterSlot from "./CharacterSlot.vue";
import "./socket";
import { nickname } from "./socket";

export const characters: Record<string, CharacterInfo> = {
    coots: {
        nickname: "Coots Prime",
        initialRelevancy: 1
    },
    ludwig: {
        nickname: "Ludwig",
        initialRelevancy: 1
    },
    qt: {
        nickname: "QtCinderella",
        initialRelevancy: 1
    },
    ders: {
        nickname: "Ders",
        initialRelevancy: 1
    },
    slime: {
        nickname: "Slime",
        initialRelevancy: 1
    },
    stanz: {
        nickname: "Stanz",
        initialRelevancy: 1
    },
    beast: {
        nickname: "Mr.Beast",
        initialRelevancy: 1
    },
    car: {
        nickname: "Red Car",
        initialRelevancy: 1
    }
};

/**
 * @hidden
 */
export const main = createLayer("main", function (this: BaseLayer) {
    const lives = ref<number>(3);
    const wins = ref<number>(0);
    const turn = ref<number>(0);
    const team = ref<Character[]>([]);
    const shop = ref<string[]>([]);

    return {
        name: "Game",
        minimizable: false,
        display: jsx(() => (
            <div style="display: flex; flex-direction: column">
                <h2>{nickname.value}</h2>
                <Spacer height="10vh" />
                <Row>
                    <CharacterSlot character={team.value[0]} />
                    <CharacterSlot character={team.value[1]} />
                    <CharacterSlot character={team.value[2]} />
                </Row>
                <Spacer height="10vh" />
                <Row>
                    {shop.value.map(item => (
                        <CharacterSlot
                            character={
                                item
                                    ? { type: item, relevancy: characters[item].initialRelevancy }
                                    : undefined
                            }
                            onClick={() => console.log(item)}
                        />
                    ))}
                </Row>
                <Spacer />
                <button onClick={() => console.log("play")}>Start Stream!</button>
            </div>
        )),
        lives,
        wins,
        turn,
        team,
        shop
    };
});

/**
 * Given a player save data object being loaded, return a list of layers that should currently be enabled.
 * If your project does not use dynamic layers, this should just return all layers.
 */
export const getInitialLayers = (
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    player: Partial<Player>
): Array<GenericLayer> => [main];

/**
 * A computed ref whose value is true whenever the game is over.
 */
export const hasWon = computed(() => {
    return false;
});

/**
 * Given a player save data object being loaded with a different version, update the save data object to match the structure of the current version.
 * @param oldVersion The version of the save being loaded in
 * @param player The save data being loaded in
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export function fixOldSave(
    oldVersion: string | undefined,
    player: Partial<Player>
    // eslint-disable-next-line @typescript-eslint/no-empty-function
): void {}
/* eslint-enable @typescript-eslint/no-unused-vars */
