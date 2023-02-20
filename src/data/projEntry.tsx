import Row from "components/layout/Row.vue";
import Spacer from "components/layout/Spacer.vue";
import { jsx } from "features/feature";
import type { BaseLayer, GenericLayer } from "game/layers";
import { createLayer } from "game/layers";
import type { Player } from "game/player";
import { computed, ref, TransitionGroup } from "vue";
import CharacterSlot from "./CharacterSlot.vue";
import "./socket";
import "./common.css";
import { emit, nickname } from "./socket";
import ludwig from "../../public/Ludwig Coots.png";
import maid from "../../public/Maid Coots.png";
import mail from "../../public/Mogul Mail Coots.png";
import money from "../../public/Mogul Money Coots.png";
import coots from "../../public/Normal Coots.png";
import qt from "../../public/QT Coots.png";
import stanz from "../../public/Stanz Coots.png";
import vespa from "../../public/Vespa Coots.png";
import heart from "../../public/heart.png";
import startStream from "../../public/start stream.png";
import { createReset } from "features/reset";
import settings from "game/settings";
import type { AbilityTypes, CharacterInfo, Character, BattleOutcome } from "./types";
import { formatWhole } from "util/bignum";
import particles from "./particle.json";
import { createParticles } from "features/particles/particles";
import { render } from "util/vue";

export const characters: Record<string, CharacterInfo> = {
    coots: {
        nickname: "Coots",
        initialRelevancy: 1,
        initialPresence: 1,
        display: coots,
        abilityType: "LivestreamJoined",
        abilityDescription: "Do nothing",
        performAbility() {}
    },
    ludwig: {
        nickname: "Ludwig Coots",
        initialRelevancy: 1,
        initialPresence: 1,
        display: ludwig,
        abilityType: "LivestreamJoined",
        abilityDescription: "Do nothing",
        performAbility() {}
    },
    qt: {
        nickname: "Qt Coots",
        initialRelevancy: 1,
        initialPresence: 1,
        display: qt,
        abilityType: "LivestreamJoined",
        abilityDescription: jsx(() => (
            <>
                <i>Livestream joined</i>: Set both stats to 100
            </>
        )),
        performAbility(char) {
            char.presence = 100;
            char.relevancy = 100;
        }
    },
    maid: {
        nickname: "Maid Coots",
        initialRelevancy: 1,
        initialPresence: 1,
        display: maid,
        abilityType: "LivestreamJoined",
        abilityDescription: "Do nothing",
        performAbility() {}
    },
    mail: {
        nickname: "Mogul Mail Coots",
        initialRelevancy: 1,
        initialPresence: 1,
        display: mail,
        abilityType: "LivestreamJoined",
        abilityDescription: "Do nothing",
        performAbility() {}
    },
    stanz: {
        nickname: "Stanz Coots",
        initialRelevancy: 1,
        initialPresence: 1,
        display: stanz,
        abilityType: "LivestreamJoined",
        abilityDescription: "Do nothing",
        performAbility() {}
    },
    money: {
        nickname: "Mogul Money Coots",
        initialRelevancy: 1,
        initialPresence: 1,
        display: money,
        abilityType: "LivestreamJoined",
        abilityDescription: "Do nothing",
        performAbility() {}
    },
    vespa: {
        nickname: "Vespa Coots",
        initialRelevancy: 1,
        initialPresence: 1,
        display: vespa,
        abilityType: "LivestreamJoined",
        abilityDescription: "Do nothing",
        performAbility() {}
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
    const findingMatch = ref<boolean>(false);
    const outcome = ref<BattleOutcome | "">("");
    const showingOutcome = ref<boolean>(false);
    const previewing = ref<boolean>(false);
    const playClicked = ref<boolean>(false);
    const queue = ref<
        {
            action: AbilityTypes | "join";
            target?: Character;
        }[]
    >([]);

    const battle = ref<{
        team: Character[];
        streamers: Character[];
        enemyTeam: Character[];
        enemyStreamers: Character[];
        enemyNickname: string;
        enemyLives: number;
        enemyWins: number;
        enemyTurn: number;
    } | null>(null);

    const views = computed(() => {
        if (battle.value == null) {
            return 0;
        }
        return (
            battle.value.streamers.reduce(
                (acc, curr) => acc + Math.max(0, curr.presence) * Math.max(0, curr.relevancy),
                0
            ) * 100
        );
    });
    const enemyViews = computed(() => {
        if (battle.value == null) {
            return 0;
        }
        return (
            battle.value.enemyStreamers.reduce(
                (acc, curr) => acc + Math.max(0, curr.presence) * Math.max(0, curr.relevancy),
                0
            ) * 100
        );
    });

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
            findingMatch.value = false;
            battle.value = null;
            outcome.value = "";
            showingOutcome.value = false;
            playClicked.value = false;
            queue.value = [];
        }
    }));

    const isDragging = ref(false);

    function prepareMove() {
        if (battle.value == null) {
            throw "Preparing move while not in battle";
        }
        if (
            queue.value.length === 0 &&
            battle.value.team.length === 0 &&
            battle.value.enemyTeam.length === 0
        ) {
            if (outcome.value === "Victory") {
                wins.value++;
            } else if (outcome.value === "Defeat") {
                lives.value--;
            }
            showingOutcome.value = true;
            return;
        }
        if (queue.value.length === 0) {
            queue.value.push({
                action: "join"
            });
        } else if (queue.value.length > 1) {
            queue.value = queue.value.sort((a, b) => {
                if (a.action !== b.action) {
                    return 1;
                }
                if (a.target != null && b.target != null) {
                    return b.target.relevancy - a.target.relevancy;
                }
                return 0;
            });
        }
        if (settings.autoplay === false && playClicked.value === false) {
            previewing.value = true;
        } else {
            previewing.value = false;
            const action = queue.value.shift()!;
            switch (action.action) {
                case "join":
                    if ((battle.value.team.length ?? 0) > 0) {
                        const char = battle.value.team.pop()!;
                        battle.value.streamers.push(char);
                        if (characters[char.type].abilityType === "LivestreamJoined") {
                            queue.value.unshift({ action: "LivestreamJoined", target: char });
                        }
                    }
                    if ((battle.value.enemyTeam.length ?? 0) > 0) {
                        const char = battle.value.enemyTeam.pop()!;
                        battle.value.enemyStreamers.push(char);
                        if (characters[char.type].abilityType === "LivestreamJoined") {
                            queue.value.unshift({ action: "LivestreamJoined", target: char });
                        }
                    }
                    break;
                default:
                    if (action.target == null) {
                        console.error("Invalid action", action);
                        break;
                    }
                    characters[action.target.type].performAbility(action.target);
                    break;
            }
            playClicked.value = false;
            setTimeout(prepareMove, settings.fast ? 750 : 1250);
        }
    }

    const particles = createParticles(() => ({
        fullscreen: false,
        zIndex: 10,
        boundingRect: ref<null | DOMRect>(null),
        onContainerResized(boundingRect) {
            this.boundingRect.value = boundingRect;
        }
    }));

    return {
        name: "Game",
        minimizable: false,
        display: jsx(() => {
            if (battle.value != null) {
                return (
                    <div class={{ ["battle-container"]: true, fast: settings.fast }}>
                        <div class="battle-controls">
                            <button
                                class="button"
                                onClick={() => {
                                    playClicked.value = true;
                                    prepareMove();
                                }}
                            >
                                <span class="material-icons">play_arrow</span>
                                <span>Play</span>
                            </button>
                            <button
                                class={{ button: true, active: settings.autoplay }}
                                onClick={() => {
                                    settings.autoplay = !settings.autoplay;
                                    if (previewing.value) {
                                        prepareMove();
                                    }
                                }}
                            >
                                <span class="material-icons">all_inclusive</span>
                                <span>Autoplay</span>
                            </button>
                            <button
                                class={{ button: true, active: settings.fast }}
                                onClick={() => (settings.fast = !settings.fast)}
                            >
                                <span class="material-icons">fast_forward</span>
                                <span>Fast</span>
                            </button>
                        </div>
                        <div
                            class="teams-container"
                            style={showingOutcome.value ? "pointer-events: none;" : ""}
                        >
                            <div class="team-container">
                                <div class="stream-container">
                                    <div class="stream-details" style="left: 1vmin">
                                        <span style="margin-left: 0">{nickname.value} (YOU)</span>
                                        <div class="stats" style="margin-left: 0">
                                            <div class="resource-box">
                                                <img src={heart} />
                                                <span>{lives.value}</span>
                                            </div>
                                            <div class="resource-box">
                                                <span class="material-icons">emoji_events</span>
                                                <span>{wins.value}/5</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="view-counter" style="right: 1vmin">
                                        {formatWhole(views.value)} Views
                                    </div>
                                    <Row class="streamers-container">
                                        <TransitionGroup name="character-transition">
                                            {battle.value.streamers
                                                .slice()
                                                .reverse()
                                                .map((streamer, i) => (
                                                    <CharacterSlot
                                                        key={battle.value!.streamers.length - i}
                                                        character={streamer}
                                                        shake={
                                                            previewing.value &&
                                                            queue.value[0]?.target === streamer
                                                        }
                                                    />
                                                ))}
                                        </TransitionGroup>
                                    </Row>
                                </div>
                                <Row class="members-container" style="margin-left: 0">
                                    <TransitionGroup name="character-transition">
                                        {battle.value.team.map((member, i) => (
                                            <CharacterSlot
                                                character={member}
                                                key={i}
                                                shake={
                                                    previewing.value &&
                                                    queue.value[0]?.action === "join" &&
                                                    member ===
                                                        battle.value?.team[
                                                            (battle.value?.team.length ?? 0) - 1
                                                        ]
                                                }
                                            />
                                        ))}
                                    </TransitionGroup>
                                </Row>
                            </div>
                            <div class="team-container">
                                <div class="stream-container">
                                    <div class="stream-details" style="right: 1vmin">
                                        <span style="margin-right: 0">
                                            {battle.value.enemyNickname}
                                        </span>
                                        <div class="stats" style="margin-right: 0">
                                            <div class="resource-box">
                                                <img src={heart} />
                                                <span>{battle.value.enemyLives}</span>
                                            </div>
                                            <div class="resource-box">
                                                <span class="material-icons">emoji_events</span>
                                                <span>{battle.value.enemyWins}/5</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="view-counter" style="left: 1vmin">
                                        {formatWhole(enemyViews.value)} Views
                                    </div>
                                    <Row class="streamers-container">
                                        <TransitionGroup name="character-transition">
                                            {battle.value.enemyStreamers.map((streamer, i) => (
                                                <CharacterSlot
                                                    key={i}
                                                    character={streamer}
                                                    shake={
                                                        previewing.value &&
                                                        queue.value[0]?.target === streamer
                                                    }
                                                />
                                            ))}
                                        </TransitionGroup>
                                    </Row>
                                </div>
                                <Row class="members-container" style="margin-right: 0">
                                    <TransitionGroup name="character-transition">
                                        {battle.value.enemyTeam
                                            .slice()
                                            .reverse()
                                            .map((member, i) => (
                                                <CharacterSlot
                                                    character={member}
                                                    key={battle.value!.enemyStreamers.length + i}
                                                    shake={
                                                        previewing.value &&
                                                        queue.value[0]?.action === "join" &&
                                                        member ===
                                                            battle.value?.enemyTeam[
                                                                (battle.value?.enemyTeam.length ??
                                                                    0) - 1
                                                            ]
                                                    }
                                                />
                                            ))}
                                    </TransitionGroup>
                                </Row>
                            </div>
                        </div>
                        {showingOutcome.value ? (
                            <div class="outcome" onClick={() => emit("newTurn")}>
                                <span>{outcome.value}</span>
                                <span style="font-size: 2vmin">Next Turn</span>
                            </div>
                        ) : null}
                    </div>
                );
            }

            return (
                <div
                    class="game-container"
                    style={findingMatch.value ? "pointer-events: none" : ""}
                    onClick={() => {
                        selectedCharacter.value = null;
                        selectedShopItem.value = null;
                    }}
                >
                    <Row style="position: absolute; top: 10px; left: -5px">
                        <div class="resource-box">
                            <span class="material-icons">credit_card</span>
                            {gold.value}
                        </div>
                        <div class="resource-box">
                            <img src={heart} />
                            {lives.value}
                        </div>
                        <div class="resource-box">
                            <span class="material-icons">emoji_events</span>
                            {wins.value}/5
                        </div>
                    </Row>
                    <h2 style="font-size: 3vmin">{nickname.value}</h2>
                    <Row style="margin-top: 10vh">
                        {new Array(3).fill(0).map((_, i) => (
                            <CharacterSlot
                                id={`team-char-${i}`}
                                character={team.value[i]}
                                isSelected={selectedCharacter.value === i}
                                selected={
                                    selectedCharacter.value == null
                                        ? selectedShopItem.value == null ||
                                          (team.value[i] != null &&
                                              shop.value[selectedShopItem.value]?.type !==
                                                  team.value[i]?.type) ||
                                          gold.value < 3
                                            ? null
                                            : shop.value[selectedShopItem.value]
                                        : team.value[selectedCharacter.value]
                                }
                                isDragging={isDragging.value}
                                onClick={clickCharacter(i)}
                                onDragstart={() => {
                                    isDragging.value = true;
                                    selectedCharacter.value = i;
                                    selectedShopItem.value = null;
                                }}
                                onDragend={() => {
                                    isDragging.value = false;
                                    selectedCharacter.value = null;
                                    selectedShopItem.value = null;
                                }}
                                onDrop={() => clickCharacter(i)()}
                            />
                        ))}
                    </Row>
                    <Row style="margin-top: 10vh">
                        <div
                            class="reroll"
                            style={
                                gold.value > 0 ? "" : "color: var(--locked); cursor: not-allowed"
                            }
                            onClick={() => {
                                if (gold.value > 0) {
                                    emit("reroll");
                                }
                            }}
                        >
                            <span class="material-icons" style="font-size: 8vmin">
                                casino
                            </span>
                            <span style="font-size: 2vmin">Roll</span>
                        </div>
                        {shop.value.map((item, i) => (
                            <CharacterSlot
                                id={`shop-char-${i}`}
                                character={item == null ? undefined : item}
                                isSelected={selectedShopItem.value === i}
                                isShop={true}
                                isDragging={isDragging.value}
                                onClick={(e: MouseEvent) => {
                                    if (item == null) {
                                        return;
                                    }
                                    selectedShopItem.value =
                                        selectedShopItem.value === i ? null : i;
                                    selectedCharacter.value = null;
                                    e.stopPropagation();
                                }}
                                onDragstart={() => {
                                    isDragging.value = true;
                                    selectedCharacter.value = null;
                                    selectedShopItem.value = i;
                                }}
                                onDragend={() => {
                                    isDragging.value = false;
                                    selectedCharacter.value = null;
                                    selectedShopItem.value = null;
                                }}
                            />
                        ))}
                    </Row>
                    <Spacer height="4vh" />
                    {findingMatch.value ? (
                        <div class="waiting">Finding opposing team...</div>
                    ) : (
                        <Row class="bottom-row">
                            {selectedCharacter.value == null ? null : (
                                <button
                                    class="button"
                                    onDragover={e => e.preventDefault()}
                                    onClick={() => emit("sell", selectedCharacter.value!)}
                                    onDrop={() => emit("sell", selectedCharacter.value!)}
                                >
                                    Sell
                                </button>
                            )}
                            {selectedShopItem.value == null ? null : (
                                <button
                                    class="button"
                                    onDragover={e => e.preventDefault()}
                                    onClick={() => emit("freeze", selectedShopItem.value!)}
                                    onDrop={() => emit("freeze", selectedShopItem.value!)}
                                >
                                    Freeze
                                </button>
                            )}
                            <div style="flex-grow: 1" />
                            <img
                                class="startStream"
                                draggable="false"
                                onClick={() => {
                                    emit("stream");
                                    findingMatch.value = true;
                                }}
                                src={startStream}
                            />
                        </Row>
                    )}
                    {render(particles)}
                </div>
            );
        }),
        lives,
        wins,
        turn,
        gold,
        team,
        shop,
        selectedCharacter,
        selectedShopItem,
        findingMatch,
        showingOutcome,
        outcome,
        reset,
        battle,
        playClicked,
        prepareMove,
        particles
    };
});

function clickCharacter(index: number) {
    return (e?: MouseEvent) => {
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
        e?.stopPropagation();
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
