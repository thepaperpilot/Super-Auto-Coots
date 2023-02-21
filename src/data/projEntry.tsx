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
import { createParticles } from "features/particles/particles";
import { render } from "util/vue";
import { globalBus } from "game/events";
import victoryParticles from "./victory.json";
import shopStill from "../../public/shop1.png";
import shopGif from "../../public/shop.gif";

export const characters: Record<string, CharacterInfo> = {
    // Tier 1
    coots: {
        nickname: "Coots",
        initialRelevancy: 3,
        initialPresence: 1,
        display: coots,
        abilityType: "LivestreamJoined",
        abilityDescription: char =>
            jsx(() => (
                <>
                    <i>Livestream joined</i>: Deal {char.exp >= 6 ? 6 : char.exp >= 3 ? 4 : 2}{" "}
                    relevancy damage to every character on a stream
                </>
            )),
        performAbility(char) {
            if (main.battle.value == null) {
                return;
            }
            const damage = char.exp >= 6 ? 6 : char.exp >= 3 ? 4 : 2;
            main.battle.value.streamers.forEach(s => (s.relevancy -= damage));
            main.battle.value.enemyStreamers.forEach(s => (s.relevancy -= damage));
        }
    },
    ludwig: {
        nickname: "Ludwig Coots",
        initialRelevancy: 2,
        initialPresence: 1,
        display: ludwig,
        abilityType: "LivestreamJoined",
        abilityDescription: char =>
            jsx(() => (
                <>
                    <i>Livestream joined</i>: Gain {char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1}{" "}
                    presence for every character on a stream
                </>
            )),
        performAbility(char) {
            if (main.battle.value == null) {
                return;
            }
            const presenceGain = char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1;
            if (main.battle.value.streamers.includes(char)) {
                char.presence += presenceGain * main.battle.value.streamers.length;
            } else {
                char.presence += presenceGain * main.battle.value.enemyStreamers.length;
            }
        }
    },
    qt: {
        nickname: "Qt Coots",
        initialRelevancy: 1,
        initialPresence: 2,
        display: qt,
        abilityType: "Sold",
        abilityDescription: char =>
            jsx(() => (
                <>
                    <i>Sold</i>: Gain {char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1} mogul
                    {char.exp >= 3 ? "s" : ""}
                </>
            )),
        performAbility(char) {
            const goldGain = char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1;
            main.gold.value += goldGain;
        }
    },
    // Tier 2
    maid: {
        nickname: "Maid Coots",
        initialRelevancy: 2,
        initialPresence: 2,
        display: maid,
        abilityType: "LevelUp",
        abilityDescription: char =>
            jsx(() => (
                <>
                    <i>Level up</i>: Every character gains {char.exp >= 3 ? 2 : 1} relevancy and
                    presence
                </>
            )),
        performAbility(char) {
            const statGain = char.exp >= 6 ? 2 : 1;
            main.team.value.forEach(char => {
                if (char) {
                    char.relevancy += statGain;
                    char.presence += statGain;
                }
            });
        }
    },
    mail: {
        nickname: "Mogul Mail Coots",
        initialRelevancy: 1,
        initialPresence: 1,
        display: mail,
        abilityType: "LivestreamJoined",
        abilityDescription: char =>
            jsx(() => (
                <>
                    <i>Livestream joined</i>: Summon a lv{" "}
                    {char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1} Ludwig Coots with this character's
                    stats.
                </>
            )),
        performAbility(char) {
            if (main.battle.value == null) {
                return;
            }
            const level = char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1;
            const newChar = {
                type: "ludwig",
                exp: level === 3 ? 6 : level === 2 ? 3 : 1,
                presence: char.presence,
                relevancy: char.relevancy
            };
            main.queue.value.push({ action: "LivestreamJoined", target: newChar });
            if (main.battle.value.streamers.includes(char)) {
                main.battle.value.streamers.push(newChar);
            } else {
                main.battle.value.enemyStreamers.push(newChar);
            }
        }
    },
    stanz: {
        nickname: "Stanz Coots",
        initialRelevancy: 1,
        initialPresence: 1,
        display: stanz,
        abilityType: "LivestreamEnded",
        abilityDescription: char =>
            jsx(() => (
                <>
                    <i>Livestream ended</i>: Gain {char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1}{" "}
                    relevancy for every character on either livestream with more relevancy.
                </>
            )),
        performAbility(char) {
            if (main.battle.value == null) {
                return;
            }
            const relevancyGain = char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1;
            char.relevancy +=
                relevancyGain *
                (main.battle.value.streamers.filter(m => m.relevancy < char.relevancy).length +
                    main.battle.value.enemyStreamers.filter(m => m.relevancy < char.relevancy)
                        .length);
        }
    },
    // Tier 3
    money: {
        nickname: "Mogul Money Coots",
        initialRelevancy: 1,
        initialPresence: 1,
        display: money,
        abilityType: "StreamStarted",
        abilityDescription: char =>
            jsx(() => (
                <>
                    <i>Stream started</i>: Permanently gain{" "}
                    {char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1} presence if you have 2 or more
                    moguls.
                </>
            )),
        performAbility(char) {
            if (main.gold.value >= 2) {
                const presenceGain = char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1;
                char.presence += presenceGain;
            }
        }
    },
    vespa: {
        nickname: "Vespa Coots",
        initialRelevancy: 1,
        initialPresence: 1,
        display: vespa,
        abilityType: "LivestreamJoined",
        abilityDescription: () =>
            jsx(() => (
                <>
                    <i>Livestream joined</i>: Set the character that most recently joined the enemy
                    livestream's presence to 0. This effect does not improve on level up.
                </>
            )),
        performAbility(char) {
            if (main.battle.value == null) {
                return;
            }
            if (main.battle.value.streamers.includes(char)) {
                if (main.battle.value.enemyStreamers.length > 0) {
                    main.battle.value.enemyStreamers[
                        main.battle.value.enemyStreamers.length - 1
                    ].presence = 0;
                }
            } else {
                if (main.battle.value.streamers.length > 0) {
                    main.battle.value.streamers[
                        main.battle.value.streamers.length - 1
                    ].presence = 0;
                }
            }
        }
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
    const frozen = ref<number[]>([]);
    const showRefreshAnim = ref<boolean>(false);

    const battle = ref<{
        team: Character[];
        streamers: Character[];
        enemyTeam: Character[];
        enemyStreamers: Character[];
        enemyNickname: string;
        enemyLives: number;
        enemyWins: number;
        enemyTurn: number;
        ranLivestreamEnded: boolean;
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
            frozen.value = [];
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
            if (battle.value.ranLivestreamEnded === false) {
                battle.value.streamers.forEach(m => {
                    if (characters[m.type].abilityType === "LivestreamEnded") {
                        queue.value.push({ action: "LivestreamEnded", target: m });
                    }
                });
                battle.value.enemyStreamers.forEach(m => {
                    if (characters[m.type].abilityType === "LivestreamEnded") {
                        queue.value.push({ action: "LivestreamEnded", target: m });
                    }
                });
                battle.value.ranLivestreamEnded = true;
                prepareMove();
                return;
            }
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
            if (wins.value >= 5) {
                return (
                    <div class="total-outcome-container">
                        <span class="total-outcome">You Won!</span>
                        <span class="smiley">😃</span>
                        <Row>
                            {new Array(3).fill(0).map((_, i) => (
                                <CharacterSlot character={team.value[i]} />
                            ))}
                        </Row>
                        <button class="button" onClick={() => location.reload()}>
                            Play again
                        </button>
                        {render(particles)}
                    </div>
                );
            }
            if (lives.value <= 0) {
                return (
                    <div class="total-outcome-container">
                        <span class="total-outcome">You ran out of lives!</span>
                        <span class="smiley">😰</span>
                        <Row>
                            {new Array(3).fill(0).map((_, i) => (
                                <CharacterSlot character={team.value[i]} />
                            ))}
                        </Row>
                        <button class="button" onClick={() => location.reload()}>
                            Play again
                        </button>
                        {render(particles)}
                    </div>
                );
            }
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
                                <Row
                                    class="members-container"
                                    style="margin-left: 0; padding-right: 4vmin;"
                                >
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
                                <Row
                                    class="members-container"
                                    style="margin-right: 0; padding: 0 4vmin;"
                                >
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
                    <h2 class="team-nickname">{nickname.value}</h2>
                    <Row class="manager-header">
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
                        <div style="flex-grow: 1" />
                        {findingMatch.value ? (
                            <div class="waiting">Finding opposing team...</div>
                        ) : (
                            <>
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
                                <img
                                    class="startStream"
                                    draggable="false"
                                    onClick={() => {
                                        emit("stream");
                                        findingMatch.value = true;
                                    }}
                                    src={startStream}
                                />
                            </>
                        )}
                    </Row>
                    <div style="flex-grow: 1" />
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
                    <Row class="shop">
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
                            <img src={showRefreshAnim.value ? shopGif : shopStill} />
                        </div>
                        {shop.value.map((item, i) => (
                            <CharacterSlot
                                id={`shop-char-${i}`}
                                frozen={frozen.value.includes(i)}
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
        frozen,
        playClicked,
        prepareMove,
        particles,
        queue,
        showRefreshAnim
    };
});

let timeSinceFirework = 0;
globalBus.on("update", diff => {
    if (main.wins.value >= 5) {
        timeSinceFirework += diff;
        if (timeSinceFirework >= 1) {
            timeSinceFirework = 0;
            const boundingRect = main.particles.boundingRect.value;
            if (!boundingRect) {
                return;
            }
            main.particles.addEmitter(victoryParticles).then(e => {
                e.updateOwnerPos(
                    Math.random() * boundingRect.width,
                    Math.random() * boundingRect.height
                );
                console.log(e);
                e.playOnceAndDestroy();
            });
        }
    } else {
        timeSinceFirework = 0;
    }
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
