import Row from "components/layout/Row.vue";
import Spacer from "components/layout/Spacer.vue";
import { jsx } from "features/feature";
import type { BaseLayer, GenericLayer } from "game/layers";
import { createLayer } from "game/layers";
import type { Player } from "game/player";
import { computed, ref } from "vue";
import CharacterSlot from "./CharacterSlot.vue";
import "./socket";
import "./common.css";
import { emit, nickname } from "./socket";
import coots from "../../public/coots.png";
import { createReset } from "features/reset";

export const characters: Record<string, CharacterInfo> = {
    coots: {
        nickname: "Coots Prime",
        initialRelevancy: 1,
        initialPresence: 1,
        display: coots
    },
    ludwig: {
        nickname: "Ludwig",
        initialRelevancy: 1,
        initialPresence: 1,
        display: coots
    },
    qt: {
        nickname: "QtCinderella",
        initialRelevancy: 1,
        initialPresence: 1,
        display: coots
    },
    ders: {
        nickname: "Ders",
        initialRelevancy: 1,
        initialPresence: 1,
        display: coots
    },
    slime: {
        nickname: "Slime",
        initialRelevancy: 1,
        initialPresence: 1,
        display: coots
    },
    stanz: {
        nickname: "Stanz",
        initialRelevancy: 1,
        initialPresence: 1,
        display: coots
    },
    beast: {
        nickname: "Mr.Beast",
        initialRelevancy: 1,
        initialPresence: 1,
        display: coots
    },
    car: {
        nickname: "Red Car",
        initialRelevancy: 1,
        initialPresence: 1,
        display: coots
    },
    hasan: {
        nickname: "Hasanabi",
        initialRelevancy: 1,
        initialPresence: 1,
        display: coots
    }
};

/**
 * @hidden
 */
export const main = createLayer("main", function (this: BaseLayer) {
    const lives = ref<number>(3);
    const wins = ref<number>(0);
    const turn = ref<number>(0);
    const gold = ref<number>(0);
    const team = ref<(Character | null)[]>([null, null, null]);
    const shop = ref<(Character | null)[]>([]);
    const selectedCharacter = ref<number | null>(null);
    const selectedShopItem = ref<number | null>(null);

    const reset = createReset(() => ({
        onReset() {
            lives.value = 3;
            wins.value = 0;
            turn.value = 0;
            gold.value = 0;
            team.value = [null, null, null];
            shop.value = [];
            selectedCharacter.value = null;
            selectedShopItem.value = null;
        }
    }));

    return {
        name: "Game",
        minimizable: false,
        display: jsx(() => (
            <div
                style="display: flex; flex-direction: column"
                onClick={() => {
                    selectedCharacter.value = null;
                    selectedShopItem.value = null;
                }}
            >
                <Row style="position: absolute; top: 20px">
                    <div class="resource-box">
                        <span class="material-icons">credit_card</span>
                        {gold.value}
                    </div>
                    <div class="resource-box">
                        <span class="material-icons">favorite</span>
                        {lives.value}
                    </div>
                    <div class="resource-box">
                        <span class="material-icons">emoji_events</span>
                        {wins.value}/5
                    </div>
                </Row>
                <h2>{nickname.value}</h2>
                <Spacer height="10vh" />
                <Row>
                    {new Array(3).fill(0).map((_, i) => (
                        <CharacterSlot
                            character={team.value[i]}
                            isSelected={selectedCharacter.value === i}
                            selected={
                                selectedCharacter.value == null
                                    ? selectedShopItem.value == null ||
                                      (team.value[i] != null &&
                                          shop.value[selectedShopItem.value]?.type !==
                                              team.value[i]?.type)
                                        ? null
                                        : shop.value[selectedShopItem.value]
                                    : team.value[selectedCharacter.value]
                            }
                            onClick={clickCharacter(i)}
                        />
                    ))}
                </Row>
                <Spacer height="10vh" />
                <Row>
                    {shop.value.map((item, i) => (
                        <CharacterSlot
                            character={item == null ? undefined : item}
                            isSelected={selectedShopItem.value === i}
                            onClick={(e: MouseEvent) => {
                                if (item == null) {
                                    return;
                                }
                                selectedShopItem.value = selectedShopItem.value === i ? null : i;
                                selectedCharacter.value = null;
                                e.stopPropagation();
                            }}
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
        gold,
        team,
        shop,
        selectedCharacter,
        selectedShopItem,
        reset
    };
});

function clickCharacter(index: number) {
    return (e: MouseEvent) => {
        if (main.selectedCharacter.value != null && main.selectedCharacter.value !== index) {
            if (
                main.team.value[main.selectedCharacter.value]?.type ===
                    main.team.value[index]?.type &&
                (main.team.value[main.selectedCharacter.value]?.exp ?? 0) < 6 &&
                (main.team.value[index]?.exp ?? 0) < 6
            ) {
                emit("merge", main.selectedCharacter.value, index);
                main.selectedCharacter.value = null;
            } else {
                emit("move", main.selectedCharacter.value, index);
                main.selectedCharacter.value = null;
            }
        } else if (main.selectedCharacter.value === index) {
            main.selectedCharacter.value = null;
        } else if (main.selectedShopItem.value !== null) {
            if (
                (main.team.value[index] == null ||
                    (main.team.value[index]!.type ===
                        main.shop.value[main.selectedShopItem.value]?.type &&
                        main.team.value[index]!.exp < 6)) &&
                main.gold.value >= 3
            ) {
                emit("buy", main.selectedShopItem.value, index);
            }
            main.selectedShopItem.value = null;
        } else {
            main.selectedCharacter.value = index;
        }
        e.stopPropagation();
    };
}

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
