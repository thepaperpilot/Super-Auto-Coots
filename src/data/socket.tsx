import Text from "components/fields/Text.vue";
import projInfo from "data/projInfo.json";
import { jsx, setDefault } from "features/feature";
import { globalBus } from "game/events";
import settings, { registerSettingField } from "game/settings";
import satisfies from "semver/functions/satisfies";
import { io, Socket } from "socket.io-client";
import { ref, watch } from "vue";
import { useToast } from "vue-toastification";
import particle from "./particle.json";
import { characters, getCharID, main } from "./projEntry";
import {
    BattleOutcome,
    Character,
    ClientToServerEvents,
    ServerToClientEvents,
    StreamTypes
} from "./types";
import healthParticles from "./health.json";
import presenceParticles from "./presence.json";
import { EmitterConfigV3 } from "@pixi/particle-emitter";

export const connected = ref<boolean>(false);
export const nickname = ref<string>("");
export const room = ref<string>("");
export const roomConnectionError = ref<string>("");

const toast = useToast();

const socket = ref<Socket<ServerToClientEvents, ClientToServerEvents> | null>();
const connectionError = ref<string>("");

export function emit<T extends keyof ClientToServerEvents>(
    event: T,
    ...args: Parameters<ClientToServerEvents[T]>
): void {
    if (!connected.value) {
        return;
    }
    socket.value?.emit(event, ...args);
}

globalBus.on("loadSettings", settings => {
    setDefault(settings, "server", "https://Super-Auto-Coots.thepaperpilot.repl.co");

    watch(
        () => settings.server,
        server => {
            if (socket.value) {
                socket.value.close();
            }

            socket.value = io(server);
            setupSocket(socket.value);

            connected.value = false;
            connectionError.value = "";
            socket.value.connect();
        },
        { immediate: true }
    );

    registerSettingField(
        jsx(() => (
            <>
                <Text
                    title="Server URL"
                    onUpdate:modelValue={value => (settings.server = value)}
                    modelValue={settings.server}
                />
                <div style="font-style: italic; font-size: small; margin-top: -10px;">
                    {connected.value ? (
                        <span>Connected!</span>
                    ) : connectionError.value ? (
                        <span style="color: red">{connectionError.value}</span>
                    ) : (
                        <span>Connecting...</span>
                    )}
                </div>
            </>
        ))
    );
});

export function poof(id: string, particleConfig?: EmitterConfigV3) {
    const boundingRect = main.particles.boundingRect.value;
    if (!boundingRect) {
        return;
    }
    const rect = main.nodes.value[id]?.rect;
    if (rect) {
        main.particles.addEmitter(particleConfig ?? particle).then(e => {
            e.updateOwnerPos(
                rect.x + rect.width / 2 - boundingRect.x,
                rect.y + rect.height / 2 - boundingRect.y
            );
            e.playOnceAndDestroy();
        });
    }
}

function setupSocket(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
    socket.on("connect", () => {
        connectionError.value = "";
        connected.value = true;
        main.reset.reset();
        room.value = "";
        roomConnectionError.value = "";
        if (settings.privateRoomName) {
            socket.emit("change room", settings.privateRoomName, settings.privateRoomPassword);
        }
    });
    socket.on("connect_error", error => {
        connectionError.value = `${error.name}: ${error.message}`;
    });
    socket.on("disconnect", (reason, details) => {
        connectionError.value =
            details instanceof Error
                ? `${details.name}: ${details.message}`
                : details?.description ?? reason;
        connected.value = false;
    });
    socket.on("server version", semver => {
        if (!satisfies(projInfo.versionNumber, semver)) {
            toast.info("Server only accepts game versions in range: " + semver);
            socket.disconnect();
        }
    });

    socket.on("info", message => {
        toast.info(message);
        if (message === "Failed to start streaming") {
            main.findingMatch.value = false;
        }
    });
    socket.on("nickname", nick => {
        nickname.value = nick;
    });

    socket.on("newTurn", shop => {
        if (main.streamType.value === "Game Show") {
            main.gold.value += 10;
        } else {
            main.gold.value = 10;
        }
        main.turn.value++;
        main.battle.value = null;
        main.shop.value = shop.map(item => ({
            type: item,
            relevancy: characters[item].initialRelevancy,
            presence: characters[item].initialPresence,
            exp: 1,
            id: getCharID()
        }));
        main.frozen.value = main.frozen.value.map((_, i) => i);
        setTimeout(() => {
            shop.forEach((_, i) => poof(`shop-char-${i}`));
        }, 0);
        main.showRefreshAnim.value = true;
        setTimeout(() => (main.showRefreshAnim.value = false), 500);
        setTimeout(() => {
            main.team.value.forEach(m => {
                if (m != null && characters[m.type].abilityType === "StartTurn") {
                    characters[m.type].performAbility(m);
                }
            });
        }, 1250);
    });
    socket.on("reroll", shop => {
        main.gold.value--;
        main.shop.value = shop.map(item => ({
            type: item,
            relevancy: characters[item].initialRelevancy,
            presence: characters[item].initialPresence,
            exp: 1,
            id: getCharID()
        }));
        main.frozen.value = main.frozen.value.map((_, i) => i);
        setTimeout(() => {
            shop.forEach((_, i) => poof(`shop-char-${i}`));
        }, 0);
        main.showRefreshAnim.value = true;
        setTimeout(() => (main.showRefreshAnim.value = false), 500);
    });
    socket.on("buy", (shopIndex, teamIndex, char) => {
        main.team.value[teamIndex] = char;
        main.shop.value[shopIndex] = null;
        main.gold.value -= 3;
        poof(`shop-char-${shopIndex}`);
        poof(`team-char-${teamIndex}`);
        if (main.frozen.value.includes(shopIndex)) {
            main.frozen.value = main.frozen.value.filter(m => m !== shopIndex);
        }
    });
    socket.on("move", (index, otherIndex) => {
        const temp = main.team.value[index];
        main.team.value[index] = main.team.value[otherIndex];
        main.team.value[otherIndex] = temp;
        poof(`team-char-${index}`);
        poof(`team-char-${otherIndex}`);
    });
    socket.on("merge", (index, otherIndex, char) => {
        const oldExp = main.team.value[otherIndex]?.exp ?? 0;
        const oldLevel = oldExp >= 6 ? 3 : oldExp >= 3 ? 2 : 1;
        const newLevel = char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1;
        main.team.value[index] = null;
        main.team.value[otherIndex] = char;
        poof(`team-char-${index}`);
        poof(`team-char-${otherIndex}`);
        if (characters[char.type].abilityType === "LevelUp" && oldLevel !== newLevel) {
            setTimeout(() => characters[char.type].performAbility(char), 1250);
        }
    });
    socket.on("stream", (enemy, outcome) => {
        let needsWait = false;
        if (main.streamType.value === "Reaction Stream") {
            main.team.value.forEach((m, index) => {
                if (m == null) {
                    return;
                }
                m.relevancy += 1;
                poof(`team-char-${index}`, healthParticles);
            });
            needsWait = true;
        }
        main.team.value.forEach(m => {
            if (m == null) {
                return;
            }
            if (characters[m.type].abilityType === "StreamStarted") {
                needsWait = true;
                characters[m.type].performAbility(m);
            }
        });
        if (needsWait) {
            setTimeout(() => startStream(enemy, outcome), 1250);
        } else {
            startStream(enemy, outcome);
        }
    });
    socket.on("sell", index => {
        const member = main.team.value[index]!;
        let level;
        if (member.exp >= 6) {
            level = 3;
        } else if (member.exp >= 3) {
            level = 2;
        } else {
            level = 1;
        }
        main.gold.value += level;
        main.team.value[index] = null;
        poof(`team-char-${index}`);
        if (characters[member.type].abilityType === "Sold") {
            setTimeout(() => characters[member.type].performAbility(member), 500);
        }
    });
    socket.on("freeze", index => {
        if (main.frozen.value.includes(index)) {
            main.frozen.value = main.frozen.value.filter(m => m !== index);
        } else {
            main.frozen.value.push(index);
        }
    });
    socket.on("room", (r, streamType) => {
        main.reset.reset();
        main.streamType.value = streamType;
        room.value = r;
        roomConnectionError.value = "";
    });
    socket.on("room failed", err => {
        room.value = "";
        roomConnectionError.value = err;
    });
    socket.on("stream type", (type, charged) => {
        main.streamType.value = type;
        if (charged) {
            main.gold.value -= 3;
        }
    });
}

function startStream(
    enemy: {
        team: Character[];
        nickname: string;
        lives: number;
        wins: number;
        turn: number;
        streamType: StreamTypes;
    },
    outcome: BattleOutcome
) {
    main.findingMatch.value = false;
    main.battle.value = {
        team: JSON.parse(JSON.stringify(main.team.value.filter(m => m != null))),
        streamers: [],
        enemyTeam: enemy.team,
        enemyStreamers: [],
        enemyNickname: enemy.nickname,
        enemyLives: enemy.lives,
        enemyWins: enemy.wins,
        enemyTurn: enemy.turn,
        enemyStreamType: enemy.streamType,
        ranLivestreamEnded: false
    };
    main.battle.value.enemyTeam.forEach(m => {
        m.id = getCharID();
    });
    console.log(enemy.team, main.battle.value.enemyTeam);
    main.outcome.value = outcome;
    main.showingOutcome.value = false;
    main.playClicked.value = false;
    function checkEnemyStreamType() {
        if (main.battle.value!.enemyStreamType === "Podcast") {
            setTimeout(() => {
                const yards = main.battle.value!.enemyTeam.filter(
                    m =>
                        m != null &&
                        (m.type === "ludwig" ||
                            m.type === "nick" ||
                            m.type === "aimen" ||
                            m.type === "slime")
                );
                yards.forEach(m => {
                    m.relevancy += yards.length;
                    for (let i = 0; i < yards.length; i++) {
                        poof(
                            `battle-enemy-member-${main.battle.value!.enemyTeam.indexOf(m)}`,
                            healthParticles
                        );
                    }
                });
                setTimeout(main.prepareMove, 1250);
            }, 1250);
        } else if (main.battle.value!.enemyStreamType === "Cooking Stream") {
            setTimeout(() => {
                if (main.battle.value!.enemyTeam.length > 0) {
                    const host =
                        main.battle.value!.enemyTeam[main.battle.value!.enemyTeam.length - 1];
                    host.relevancy += 2;
                    host.presence += 2;
                    poof(
                        `battle-enemy-member-${main.battle.value!.enemyTeam.indexOf(host)}`,
                        healthParticles
                    );
                    poof(
                        `battle-enemy-member-${main.battle.value!.enemyTeam.indexOf(host)}`,
                        healthParticles
                    );
                    poof(
                        `battle-enemy-member-${main.battle.value!.enemyTeam.indexOf(host)}`,
                        presenceParticles
                    );
                    poof(
                        `battle-enemy-member-${main.battle.value!.enemyTeam.indexOf(host)}`,
                        presenceParticles
                    );
                }
                setTimeout(main.prepareMove, 1250);
            }, 1250);
        } else if (main.battle.value!.enemyStreamType === "Bro vs Bro") {
            setTimeout(() => {
                if (main.battle.value!.enemyTeam.length > 0) {
                    const host =
                        main.battle.value!.enemyTeam[main.battle.value!.enemyTeam.length - 1];
                    host.relevancy++;
                    poof(
                        `battle-enemy-member-${main.battle.value!.enemyTeam.indexOf(host)}`,
                        healthParticles
                    );
                }
                if (main.battle.value!.team.length > 0) {
                    const host = main.battle.value!.team[main.battle.value!.team.length - 1];
                    host.relevancy -= 2;
                    main.hurt(host);
                }
                setTimeout(main.prepareMove, 1250);
            }, 1250);
        } else {
            setTimeout(main.prepareMove, 1250);
        }
    }
    if (main.streamType.value === "Podcast") {
        setTimeout(() => {
            const yards = main.battle.value!.team.filter(
                m =>
                    m != null &&
                    (m.type === "ludwig" ||
                        m.type === "nick" ||
                        m.type === "aimen" ||
                        m.type === "slime")
            );
            yards.forEach(m => {
                m.relevancy += yards.length;
                for (let i = 0; i < yards.length; i++) {
                    poof(
                        `battle-member-${main.battle.value!.enemyTeam.indexOf(m)}`,
                        healthParticles
                    );
                }
            });
            checkEnemyStreamType();
        }, 1250);
    } else if (main.streamType.value === "Cooking Stream") {
        setTimeout(() => {
            if (main.battle.value!.team.length > 0) {
                const host = main.battle.value!.team[main.battle.value!.team.length - 1];
                host.relevancy += 2;
                host.presence += 2;
                poof(
                    `battle-member-${main.battle.value!.enemyTeam.indexOf(host)}`,
                    healthParticles
                );
                poof(
                    `battle-member-${main.battle.value!.enemyTeam.indexOf(host)}`,
                    healthParticles
                );
                poof(
                    `battle-member-${main.battle.value!.enemyTeam.indexOf(host)}`,
                    presenceParticles
                );
                poof(
                    `battle-member-${main.battle.value!.enemyTeam.indexOf(host)}`,
                    presenceParticles
                );
            }
            checkEnemyStreamType();
        }, 1250);
    } else if (main.streamType.value === "Bro vs Bro") {
        setTimeout(() => {
            if (main.battle.value!.team.length > 0) {
                const host = main.battle.value!.team[main.battle.value!.team.length - 1];
                host.relevancy++;
                poof(
                    `battle-enemy-member-${main.battle.value!.enemyTeam.indexOf(host)}`,
                    healthParticles
                );
            }
            if (main.battle.value!.enemyTeam.length > 0) {
                const host = main.battle.value!.enemyTeam[main.battle.value!.enemyTeam.length - 1];
                host.relevancy -= 2;
                main.hurt(host);
            }
            checkEnemyStreamType();
        }, 1250);
    } else {
        checkEnemyStreamType();
    }
}

declare module "game/settings" {
    interface Settings {
        server: string;
    }
}
