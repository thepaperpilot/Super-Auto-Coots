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
    const shop = ref<(string | null)[]>([]);
    const selectedCharacter = ref<number | null>(null);
    const selectedShopItem = ref<number | null>(null);

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
                    <CharacterSlot
                        character={team.value[0]}
                        selected={selectedCharacter.value === 0}
                        onClick={clickCharacter(0)}
                    />
                    <CharacterSlot
                        character={team.value[1]}
                        selected={selectedCharacter.value === 1}
                        onClick={clickCharacter(1)}
                    />
                    <CharacterSlot
                        character={team.value[2]}
                        selected={selectedCharacter.value === 2}
                        onClick={clickCharacter(2)}
                    />
                </Row>
                <Spacer height="10vh" />
                <Row>
                    {shop.value.map((item, i) => (
                        <CharacterSlot
                            character={
                                item == null
                                    ? undefined
                                    : {
                                          type: item,
                                          relevancy: characters[item].initialRelevancy,
                                          presence: characters[item].initialPresence
                                      }
                            }
                            selected={selectedShopItem.value === i}
                            onClick={(e: MouseEvent) => {
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
        selectedShopItem
    };
});

function clickCharacter(index: number) {
    return (e: MouseEvent) => {
        if (main.selectedCharacter.value != null && main.selectedCharacter.value !== index) {
            emit("move", main.selectedCharacter.value, index);
            main.selectedCharacter.value = null;
        } else if (main.selectedCharacter.value === index) {
            main.selectedCharacter.value = null;
        } else if (main.selectedShopItem.value !== null && main.team.value[index] == null) {
            if (main.gold.value >= 3) {
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
