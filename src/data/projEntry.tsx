import Column from "components/layout/Column.vue";
import Row from "components/layout/Row.vue";
import { jsx } from "features/feature";
import { createParticles } from "features/particles/particles";
import { createReset } from "features/reset";
import Tooltip from "features/tooltips/Tooltip.vue";
import { globalBus } from "game/events";
import type { BaseLayer, GenericLayer } from "game/layers";
import { createLayer } from "game/layers";
import type { Player } from "game/player";
import settings from "game/settings";
import { formatWhole } from "util/bignum";
import { render } from "util/vue";
import { computed, ref, TransitionGroup, watch } from "vue";
import type { WatchStopHandle } from "vue";
import aimen from "../../public/aimen coots.png";
import autoplay from "../../public/autoplay.png";
import game from "../../public/bro vs bro bg.png";
import connor from "../../public/cdawg va.png";
import chessboxing from "../../public/chessboxing coots.png";
import defeatButton from "../../public/Defeat Button.png";
import defeatFace from "../../public/defeat face.png";
import fast from "../../public/fast forward.png";
import freezeShop from "../../public/Freeze shop.png";
import frog from "../../public/frog Coots.png";
import hasan from "../../public/hasan coots.png";
import heart_small from "../../public/heart_small.png";
import ironmouse from "../../public/ironmouse coots.png";
import kitchen from "../../public/Kitchen BG.png";
import kitchen_small from "../../public/kitchen_small.png";
import reaction from "../../public/lud's room bg.png";
import luddy from "../../public/luddy Coots.png";
import ludwig from "../../public/Ludwig Coots.png";
import maid from "../../public/Maid Coots.png";
import mario from "../../public/mario coots.png";
import mail from "../../public/Mogul Mail Coots.png";
import gameshow from "../../public/mogul money bg.png";
import money from "../../public/Mogul Money Coots.png";
import moves from "../../public/mogul moves coots.png";
import money_small from "../../public/money_small.png";
import beast from "../../public/mr beast coots.png";
import nick from "../../public/nick coots.png";
import coots from "../../public/Normal Coots.png";
import playAgain from "../../public/Play Again.png";
import play from "../../public/play.png";
import star_small from "../../public/presence_small.png";
import qt from "../../public/QT Coots.png";
import react_small from "../../public/react_small.png";
import room_small from "../../public/room_small.png";
import shopGif from "../../public/shop.gif";
import shopStill from "../../public/shop1.png";
import sellShop from "../../public/shop_Sell1.png";
import show_small from "../../public/show_small.png";
import shop_Switch1 from "../../public/shop_Switch1.png";
import slime from "../../public/SlimeCoots.png";
import smash from "../../public/smash coots.png";
import stanz from "../../public/Stanz Coots.png";
import startStream from "../../public/start stream.png";
import awards from "../../public/streamer award coots.png";
import yard from "../../public/the yard bg.png";
import tieButton from "../../public/Tie Button.png";
import vespa from "../../public/Vespa Coots.png";
import victoryButton from "../../public/Victory Button.png";
import victoryFace from "../../public/win face.png";
import yard_small from "../../public/yard_small.png";
import CharacterSlot from "./CharacterSlot.vue";
import "./common.css";
import healthParticles from "./health.json";
import presenceParticles from "./presence.json";
import "./socket";
import { emit, nickname, poof } from "./socket";
import type { AbilityTypes, BattleOutcome, Character, CharacterInfo, StreamTypes } from "./types";
import victoryParticles from "./victory.json";
import spellParticles from "./spellparticles.json";
import Node from "components/Node.vue";

const streamTypeToBG: Record<StreamTypes, string> = {
    "Game Show": gameshow,
    "Reaction Stream": reaction,
    Podcast: yard,
    "Cooking Stream": kitchen,
    "Bro vs Bro": game
};

let nextCharID = 0;
export function getCharID() {
    return nextCharID++;
}

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
                    <img src={heart_small} />
                    <span style="color: red">Relevancy</span> damage to every Coots on either
                    livestream
                </>
            )),
        performAbility(char) {
            if (main.battle.value == null) {
                return;
            }
            const damage = char.exp >= 6 ? 6 : char.exp >= 3 ? 4 : 2;
            [...main.battle.value.streamers, ...main.battle.value.enemyStreamers].forEach(s => {
                s.relevancy -= damage;
                main.hurt(s);
            });
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
                    <img src={star_small} />
                    <span style="color: gold">Presence</span> for every Coots on that livestream
                </>
            )),
        performAbility(char) {
            if (main.battle.value == null) {
                return;
            }
            const presenceGain = char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1;
            if (main.battle.value.streamers.includes(char)) {
                char.presence += presenceGain * main.battle.value.streamers.length;
                for (let i = 0; i < presenceGain * main.battle.value.streamers.length; i++) {
                    poof(
                        `battle-streamer-${main.battle.value.streamers.indexOf(char)}`,
                        presenceParticles
                    );
                }
            } else {
                char.presence += presenceGain * main.battle.value.enemyStreamers.length;
                for (let i = 0; i < presenceGain * main.battle.value.enemyStreamers.length; i++) {
                    poof(
                        `battle-enemy-streamer-${main.battle.value.enemyStreamers.indexOf(char)}`,
                        presenceParticles
                    );
                }
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
                    <i>Sold</i>: Gain {char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1}{" "}
                    <img src={money_small} />
                    <span style="color: yellow">
                        Mogul
                        {char.exp >= 3 ? "s" : ""}
                    </span>
                </>
            )),
        performAbility(char) {
            const goldGain = char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1;
            main.gold.value += goldGain;
        }
    },
    mario: {
        nickname: "Mario Coots",
        initialPresence: 1,
        initialRelevancy: 1,
        display: mario,
        abilityType: "LivestreamJoined",
        abilityDescription: char =>
            jsx(() => (
                <>
                    <i>Livestream joined</i>: Deal {char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1}{" "}
                    <img src={star_small} />
                    <span style="color: gold">Presence</span> damage to 2 Coots that most recently
                    joined the enemy livestream
                </>
            )),
        performAbility(char) {
            if (main.battle.value == null) {
                return;
            }
            const damage = char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1;
            let opposingTeam: Character[];
            if (main.battle.value.streamers.includes(char)) {
                opposingTeam = main.battle.value.enemyStreamers;
            } else {
                opposingTeam = main.battle.value.streamers;
            }
            for (let i = 0; i < 2 && i < opposingTeam.length; i++) {
                opposingTeam[i].presence -= damage;
                main.hurt(opposingTeam[i]);
            }
        }
    },
    aimen: {
        nickname: "Aimen Coots",
        initialPresence: 1,
        initialRelevancy: 2,
        display: aimen,
        abilityType: "Sold",
        abilityDescription: char =>
            jsx(() => (
                <>
                    <i>Sold</i>: Give {char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1}{" "}
                    <img src={heart_small} />
                    <span style="color: red">Relevancy</span> to rightmost Coots
                </>
            )),
        performAbility(char) {
            const team = main.team.value.filter(m => m != null);
            if (team.length === 0) {
                return;
            }
            const relevancyGain = char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1;
            team[team.length - 1]!.relevancy += relevancyGain;
            for (let i = 0; i < relevancyGain; i++) {
                poof(`team-char-${team.length - 1}`, healthParticles);
            }
        }
    },
    nick: {
        nickname: "Nick Coots",
        initialPresence: 2,
        initialRelevancy: 1,
        display: nick,
        abilityType: "LivestreamEnded",
        abilityDescription: char =>
            jsx(() => (
                <>
                    <i>Livestream ended</i>: Each coots on this livestream gain{" "}
                    {char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1} <img src={star_small} />
                    <span style="color: gold">Presence</span>
                </>
            )),
        performAbility(char) {
            if (main.battle.value == null) {
                return;
            }
            const gain = char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1;
            if (main.battle.value.streamers.includes(char)) {
                main.battle.value.streamers.forEach((s, index) => {
                    s.presence += gain;
                    for (let i = 0; i < gain; i++) {
                        poof(`battle-streamer-${index}`, presenceParticles);
                    }
                });
            } else {
                main.battle.value.enemyStreamers.forEach((s, index) => {
                    s.presence += gain;
                    for (let i = 0; i < gain; i++) {
                        poof(`battle-enemy-streamer-${index}`, presenceParticles);
                    }
                });
            }
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
                    <i>Level up</i>: Give every Coots {char.exp >= 3 ? 2 : 1}{" "}
                    <img src={heart_small} />
                    <span style="color: red">Relevancy</span> and <img src={star_small} />
                    <span style="color: gold">Presence</span>
                </>
            )),
        performAbility(char) {
            const statGain = char.exp >= 6 ? 2 : 1;
            main.team.value.forEach(char => {
                if (char) {
                    char.relevancy += statGain;
                    char.presence += statGain;
                    for (let i = 0; i < statGain; i++) {
                        poof(`team-char-${main.team.value.indexOf(char)}`, healthParticles);
                        poof(`team-char-${main.team.value.indexOf(char)}`, presenceParticles);
                    }
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
                    {char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1} Ludwig Coots with this Coots'
                    <img src={heart_small} />
                    <span style="color: red">Relevancy</span> and <img src={star_small} />
                    <span style="color: gold">Presence</span>
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
                relevancy: char.relevancy,
                id: getCharID()
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
                    <img src={heart_small} />
                    <span style="color: red">Relevancy</span> for every Coots on either livestream
                    with more <img src={heart_small} />
                    <span style="color: red">Relevancy</span>
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
    chessbox: {
        nickname: "Chessboxing Coots",
        initialRelevancy: 3,
        initialPresence: 2,
        display: chessboxing,
        abilityType: "StreamStarted",
        abilityDescription: char =>
            jsx(() => (
                <>
                    <i>Stream started</i>: Permanently gain{" "}
                    {char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1} <img src={heart_small} />
                    <span style="color: red">Relevancy</span> and swap <img src={heart_small} />
                    <span style="color: red">Relevancy</span> and <img src={star_small} />
                    <span style="color: gold">Presence</span>
                </>
            )),
        performAbility(char) {
            const gain = char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1;
            const temp = char.relevancy + gain;
            char.relevancy = char.presence;
            char.presence = temp;
        }
    },
    hasan: {
        nickname: "Hasan Coots",
        initialRelevancy: 2,
        initialPresence: 3,
        display: hasan,
        abilityType: "StartTurn",
        abilityDescription: char =>
            jsx(() => (
                <>
                    <i>Turn started</i>: If you won the last battle, all Coots gain{" "}
                    {char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1} <img src={heart_small} />
                    <span style="color: red">Relevancy</span>
                </>
            )),
        performAbility(char) {
            if (main.outcome.value !== "Victory") {
                return;
            }
            const gain = char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1;
            main.team.value.forEach(m => {
                if (m != null) {
                    m.relevancy += gain;
                    for (let i = 0; i < gain; i++) {
                        poof(`team-char-${main.team.value.indexOf(m)}`, healthParticles);
                    }
                }
            });
        }
    },
    beast: {
        nickname: "Mr.Beast Coots",
        initialRelevancy: 2,
        initialPresence: 2,
        display: beast,
        abilityType: "StartTurn",
        abilityDescription: char =>
            jsx(() => (
                <>
                    <i>Turn started</i>: Gain
                    {char.exp >= 6 ? 6 : char.exp >= 3 ? 4 : 2} <img src={money_small} />
                    <span style="color: yellow">Moguls</span>
                </>
            )),
        performAbility(char) {
            const gain = char.exp >= 6 ? 6 : char.exp >= 3 ? 4 : 2;
            main.gold.value += gain;
        }
    },
    frog: {
        nickname: "Frog Coots",
        initialRelevancy: 1,
        initialPresence: 2,
        display: frog,
        abilityType: "Faint",
        abilityDescription: char =>
            jsx(() => (
                <>
                    <i>Either stat hits 0</i>: Summon a lv{" "}
                    {char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1} Mogul Mail Coots with this Coots'{" "}
                    <img src={heart_small} />
                    <span style="color: red">Relevancy</span> and <img src={star_small} />
                    <span style="color: gold">Presence</span>
                </>
            )),
        performAbility(char) {
            if (main.battle.value == null) {
                return;
            }
            const level = char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1;
            const newChar = {
                type: "mail",
                exp: level === 3 ? 6 : level === 2 ? 3 : 1,
                presence: char.presence,
                relevancy: char.relevancy,
                id: getCharID()
            };
            main.queue.value.push({ action: "LivestreamJoined", target: newChar });
            if (main.battle.value.streamers.includes(char)) {
                main.battle.value.streamers.push(newChar);
            } else {
                main.battle.value.enemyStreamers.push(newChar);
            }
        }
    },
    moves: {
        nickname: "Mogul Moves Coots",
        initialRelevancy: 1,
        initialPresence: 2,
        display: moves,
        abilityType: "LivestreamJoined",
        abilityDescription: char =>
            jsx(() => (
                <>
                    <i>Livestream joined</i>: Gain {char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1}{" "}
                    <img src={heart_small} />
                    <span style="color: red">Relevancy</span> for every battle you've won
                </>
            )),
        performAbility(char) {
            if (main.battle.value == null) {
                return;
            }
            const gain = char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1;
            if (main.battle.value.streamers.includes(char)) {
                char.relevancy += gain * main.wins.value;
                for (let i = 0; i < gain * main.wins.value; i++) {
                    poof(
                        `battle-streamer-${main.battle.value.streamers.indexOf(char)}`,
                        healthParticles
                    );
                }
            } else {
                char.relevancy += gain * main.battle.value.enemyWins;
                for (let i = 0; i < gain * main.wins.value; i++) {
                    poof(
                        `battle-enemy-streamer-${main.battle.value.enemyStreamers.indexOf(char)}`,
                        healthParticles
                    );
                }
            }
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
                    {char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1} <img src={star_small} />
                    <span style="color: gold">Presence</span> if you have 2 or more
                    <img src={money_small} />
                    <span style="color: yellow">Moguls</span>
                </>
            )),
        performAbility(char) {
            if (main.gold.value >= 2) {
                const presenceGain = char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1;
                char.presence += presenceGain;
                for (let i = 0; i < presenceGain; i++) {
                    poof(`team-char-${i}`, presenceParticles);
                }
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
                    <i>Livestream joined</i>: Set the Coots that most recently joined the enemy
                    livestream's <img src={star_small} />
                    <span style="color: gold">Presence</span> to 0. This effect does not improve on
                    level up
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
    },
    smash: {
        nickname: "Smash Coots",
        initialRelevancy: 2,
        initialPresence: 4,
        display: smash,
        abilityType: "Hurt",
        abilityDescription: char =>
            jsx(() => (
                <>
                    <i>Hurt</i>: Gain {char.exp >= 6 ? 6 : char.exp >= 3 ? 4 : 2}{" "}
                    <img src={star_small} />
                    <span style="color: gold">Relevancy</span>
                </>
            )),
        performAbility(char) {
            if (main.battle.value == null) {
                return;
            }
            const gain = char.exp >= 6 ? 6 : char.exp >= 3 ? 4 : 2;
            char.relevancy += gain;
            for (let i = 0; i < gain; i++) {
                poof(`battle-streamer-${main.team.value.indexOf(char)}`, healthParticles);
            }
        }
    },
    connor: {
        nickname: "CDawgVA Coots",
        initialRelevancy: 2,
        initialPresence: 2,
        display: connor,
        abilityType: "Faint",
        abilityDescription: char =>
            jsx(() => (
                <>
                    <i>Either stat hits 0</i>: Summon a lv{" "}
                    {char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1} Ironmouse Coots
                </>
            )),
        performAbility(char) {
            if (main.battle.value == null) {
                return;
            }
            const level = char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1;
            const newChar = {
                type: "ironmouse",
                exp: level === 3 ? 6 : level === 2 ? 3 : 1,
                presence: characters.ironmouse.initialPresence,
                relevancy: characters.ironmouse.initialRelevancy,
                id: getCharID()
            };
            main.queue.value.push({ action: "LivestreamJoined", target: newChar });
            if (main.battle.value.streamers.includes(char)) {
                main.battle.value.streamers.push(newChar);
            } else {
                main.battle.value.enemyStreamers.push(newChar);
            }
        }
    },
    luddy: {
        nickname: "Luddy Coots",
        initialRelevancy: 2,
        initialPresence: 3,
        display: luddy,
        abilityType: "LivestreamEnded",
        abilityDescription: char =>
            jsx(() => (
                <>
                    <i>Livestream ended</i>: Deal {char.exp >= 6 ? 9 : char.exp >= 3 ? 6 : 3}{" "}
                    <img src={star_small} />
                    <span style="color: gold">Presence</span> damage to the Coots on the enemy
                    livestream with the highest <img src={star_small} />
                    <span style="color: gold">Presence</span>
                </>
            )),
        performAbility(char) {
            if (main.battle.value == null) {
                return;
            }
            if (main.battle.value.streamers.includes(char)) {
                const m = main.battle.value.enemyStreamers.reduce((a, b) => {
                    if (a.presence > b.presence) {
                        return a;
                    }
                    return b;
                });
                if (m != null) {
                    m.presence -= 3;
                    main.hurt(m);
                }
            } else {
                const m = main.battle.value.streamers.reduce((a, b) => {
                    if (a.presence > b.presence) {
                        return a;
                    }
                    return b;
                });
                if (m != null) {
                    m.presence -= 3;
                    main.hurt(m);
                }
            }
        }
    },
    slime: {
        nickname: "Slime Coots",
        initialRelevancy: 3,
        initialPresence: 3,
        display: slime,
        abilityType: "LivestreamJoined",
        abilityDescription: char =>
            jsx(() => (
                <>
                    <i>Livestream joined</i>: Give {char.exp >= 6 ? 4 : char.exp >= 3 ? 3 : 2}{" "}
                    <img src={heart_small} />
                    <span style="color: red">Relevancy</span> and <img src={star_small} />
                    <span style="color: gold">Presence</span> to the Coots who most recently joined
                    this livestream.
                </>
            )),
        performAbility(char) {
            if (main.battle.value == null) {
                return;
            }
            const gain = char.exp >= 6 ? 4 : char.exp >= 3 ? 3 : 2;
            if (main.battle.value.streamers.includes(char)) {
                if (main.battle.value.streamers.length > 1) {
                    main.battle.value.streamers[1].relevancy += gain;
                    main.battle.value.streamers[1].presence += gain;
                    for (let i = 0; i < gain; i++) {
                        poof(`battle-streamer-${1}`, healthParticles);
                        poof(`battle-streamer-${1}`, presenceParticles);
                    }
                }
            } else {
                if (main.battle.value.enemyStreamers.length > 1) {
                    main.battle.value.enemyStreamers[1].relevancy += gain;
                    main.battle.value.enemyStreamers[1].presence += gain;
                    for (let i = 0; i < gain; i++) {
                        poof(`battle-enemy-streamer-${1}`, healthParticles);
                        poof(`battle-enemy-streamer-${1}`, presenceParticles);
                    }
                }
            }
        }
    },
    awards: {
        nickname: "Streamer Awards Coots",
        initialRelevancy: 3,
        initialPresence: 3,
        display: awards,
        abilityType: "StartTurn",
        abilityDescription: char =>
            jsx(() => (
                <>
                    <i>Turn Started</i>: If you won the last battle, gain{" "}
                    {char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1} <img src={money_small} />
                    <span style="color: yellow">Moguls</span> for every battle you've won
                </>
            )),
        performAbility(char) {
            if (main.outcome.value !== "Victory") {
                return;
            }
            const gain = char.exp >= 6 ? 3 : char.exp >= 3 ? 2 : 1;
            main.gold.value += gain * main.wins.value;
        }
    },
    // Other
    ironmouse: {
        nickname: "Ironmouse Coots",
        initialRelevancy: 5,
        initialPresence: 5,
        display: ironmouse,
        abilityType: "LivestreamJoined",
        abilityDescription: char =>
            jsx(() => (
                <>
                    <i>Livestream joined</i>: Gain {char.exp >= 6 ? 6 : char.exp >= 3 ? 4 : 2}{" "}
                    <img src={heart_small} />
                    <span style="color: red">Relevancy</span> and <img src={star_small} />
                    <span style="color: gold">Presence</span>
                </>
            )),
        performAbility(char) {
            if (main.battle.value == null) {
                return;
            }
            const gain = char.exp >= 6 ? 6 : char.exp >= 3 ? 4 : 2;
            char.relevancy += gain;
            char.presence += gain;
            for (let i = 0; i < gain; i++) {
                poof(
                    `battle-${
                        main.battle.value.streamers.includes(char) ? "" : "enemy-"
                    }streamer-${1}`,
                    healthParticles
                );
                poof(
                    `battle-${
                        main.battle.value.streamers.includes(char) ? "" : "enemy-"
                    }streamer-${1}`,
                    presenceParticles
                );
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
    const selectedStreamType = ref<StreamTypes | null>(null);
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
    const streamType = ref<StreamTypes>("Cooking Stream");

    const battle = ref<{
        team: Character[];
        streamers: Character[];
        enemyTeam: Character[];
        enemyStreamers: Character[];
        enemyNickname: string;
        enemyLives: number;
        enemyWins: number;
        enemyTurn: number;
        enemyStreamType: StreamTypes;
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
            selectedStreamType.value = null;
            findingMatch.value = false;
            battle.value = null;
            outcome.value = "";
            showingOutcome.value = false;
            playClicked.value = false;
            queue.value = [];
            frozen.value = [];
            streamType.value = "Cooking Stream";
        }
    }));

    const isDragging = ref(false);

    function prepareMove() {
        if (showingOutcome.value) {
            return;
        }
        if (battle.value == null) {
            throw "Preparing move while not in battle";
        }
        if (
            queue.value.length === 0 &&
            (battle.value.streamers.find(m => m.relevancy <= 0 || m.presence <= 0) ||
                battle.value.enemyStreamers.find(m => m.relevancy <= 0 || m.presence <= 0))
        ) {
            battle.value.streamers = battle.value.streamers.filter(
                m => m.relevancy > 0 && m.presence > 0
            );
            battle.value.enemyStreamers = battle.value.enemyStreamers.filter(
                m => m.relevancy > 0 && m.presence > 0
            );
            playClicked.value = false;
            setTimeout(prepareMove, settings.fast ? 750 : 1250);
            return;
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
                    if (action.target.presence <= 0 || action.target.relevancy <= 0) {
                        break;
                    }
                    characters[action.target.type].performAbility(action.target);
                    break;
            }
            playClicked.value = false;
            setTimeout(prepareMove, settings.fast ? 750 : 1250);
        }
    }

    function hurt(char: Character) {
        if (main.battle.value == null) {
            return;
        }
        if (characters[char.type].abilityType === "Hurt") {
            main.queue.value.unshift({ action: "Hurt", target: char });
        } else if (
            characters[char.type].abilityType === "Faint" &&
            (char.presence <= 0 || char.relevancy <= 0)
        ) {
            main.queue.value.unshift({ action: "Faint", target: char });
        }
    }

    const particles = createParticles(() => ({
        fullscreen: false,
        zIndex: 10,
        boundingRect: ref<null | DOMRect>(null),
        onContainerResized(boundingRect) {
            this.boundingRect.value = boundingRect;
        },
        onHotReload() {
            shopParticleEmitter.value.then(e => e.destroy());
            shopParticleEmitter.value = particles.addEmitter(spellParticles);
            updateShopParticles();
        }
    }));

    watch([wins, lives], ([wins, lives]) => {
        if (wins >= 5) {
            settings.victories++;
        }
        if (lives <= 0) {
            settings.losses++;
        }
    });

    const shopParticleEmitter = ref(particles.addEmitter(spellParticles));
    const shopTooltip = computed(() => {
        if (selectedCharacter.value != null) {
            return "Sell Coots";
        } else if (selectedShopItem.value != null) {
            return "Freeze Coots";
        } else if (selectedStreamType.value != null) {
            return "Switch Stream Type";
        }
        return "Re-Roll Shop";
    });
    const shopImage = computed(() => {
        if (selectedCharacter.value != null) {
            return sellShop;
        } else if (selectedShopItem.value != null) {
            return freezeShop;
        } else if (selectedStreamType.value != null) {
            return shop_Switch1;
        }
        return showRefreshAnim.value ? shopGif : shopStill;
    });
    const handleShop = () => {
        if (selectedCharacter.value != null) {
            emit("sell", selectedCharacter.value!);
        } else if (selectedShopItem.value != null) {
            emit("freeze", selectedShopItem.value!);
        } else if (selectedStreamType.value != null) {
            if (gold.value > 2) {
                emit("change stream type", selectedStreamType.value);
            }
        } else {
            if (gold.value > 0) {
                emit("reroll");
            }
        }
    };
    const shouldShowParticles = computed(
        () =>
            selectedCharacter.value != null ||
            selectedShopItem.value != null ||
            (selectedStreamType.value != null && selectedStreamType.value != streamType.value)
    );
    const particleEffectWatcher = ref<null | WatchStopHandle>(null);
    const updateShopParticles = async () => {
        const particle = await shopParticleEmitter.value;
        particleEffectWatcher.value?.();
        if (shouldShowParticles.value) {
            particle.emit = true;
            particleEffectWatcher.value = watch(
                [() => main.nodes.value.reroll?.rect, particles.boundingRect],
                async ([rect, boundingRect]) => {
                    if (rect != null && boundingRect != null) {
                        particle.cleanup();
                        particle.updateOwnerPos(
                            rect.x + rect.width / 2 - boundingRect.x,
                            rect.y + rect.height / 2 - boundingRect.y
                        );
                        particle.resetPositionTracking();
                        particle.emit = true;
                    } else {
                        particle.emit = false;
                    }
                },
                { immediate: true }
            );
        } else {
            particle.emit = false;
            particleEffectWatcher.value = null;
        }
    };

    watch(shouldShowParticles, updateShopParticles);

    return {
        name: "Game",
        minimizable: false,
        minWidth: 100,
        display: jsx(() => {
            if (wins.value >= 5) {
                return (
                    <div class="total-outcome-container">
                        <img class="smiley" src={victoryFace} />
                        <Row style="margin-top: 5vmin;">
                            {new Array(3).fill(0).map((_, i) => (
                                <CharacterSlot character={team.value[i]} />
                            ))}
                        </Row>
                        <img
                            src={playAgain}
                            class="button"
                            style="height: 20vmin; image-rendering: pixelated;"
                            onClick={() => location.reload()}
                        />
                        {render(particles)}
                    </div>
                );
            }
            if (lives.value <= 0) {
                return (
                    <div class="total-outcome-container">
                        <img class="smiley" src={defeatFace} />
                        <Row style="margin-top: 5vmin;">
                            {new Array(3).fill(0).map((_, i) => (
                                <CharacterSlot character={team.value[i]} />
                            ))}
                        </Row>
                        <img src={playAgain} class="replay" onClick={() => location.reload()} />
                        {render(particles)}
                    </div>
                );
            }
            if (battle.value != null) {
                return (
                    <div class={{ ["battle-container"]: true, fast: settings.fast }}>
                        <div
                            class="battle-controls"
                            style={showingOutcome.value ? "pointer-events: none;" : ""}
                        >
                            <button
                                class="button"
                                onClick={() => {
                                    playClicked.value = true;
                                    prepareMove();
                                }}
                            >
                                <img src={play} />
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
                                <img src={autoplay} />
                            </button>
                            <button
                                class={{ button: true, active: settings.fast }}
                                onClick={() => (settings.fast = !settings.fast)}
                            >
                                <img src={fast} />
                            </button>
                        </div>
                        <div class="teams-container">
                            <div class="team-container">
                                <div class="stream-container">
                                    <div
                                        class="stream-bg"
                                        style={{
                                            backgroundImage: `url("${
                                                streamTypeToBG[streamType.value]
                                            }")`
                                        }}
                                    />
                                    <div class="stream-details" style="left: 1vmin">
                                        <span>{nickname.value} (YOU)</span>
                                        <div class="stats">
                                            <div class="resource-box lives">{lives.value}</div>
                                            <div class="resource-box wins">{wins.value}/5</div>
                                            <div class="view-counter">
                                                {formatWhole(views.value)} Views
                                            </div>
                                        </div>
                                    </div>
                                    <Row class="streamers-container">
                                        <TransitionGroup name="streamer-transition">
                                            {battle.value.streamers
                                                .slice()
                                                .reverse()
                                                .map((streamer, i) => (
                                                    <CharacterSlot
                                                        id={`battle-streamer-${i}`}
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
                                <Column class="members-container">
                                    <TransitionGroup name="character-transition">
                                        {battle.value.team.map((member, i) => (
                                            <CharacterSlot
                                                id={`battle-member-${i}`}
                                                character={member}
                                                key={battle.value!.enemyStreamers.length + i}
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
                                    <div style="font-size: 5vmin; margin: 5vmin;">→</div>
                                </Column>
                            </div>
                            <div class="team-container">
                                <div class="stream-container">
                                    <div
                                        class="stream-bg"
                                        style={{
                                            backgroundImage: `url("${
                                                streamTypeToBG[battle.value.enemyStreamType]
                                            }")`
                                        }}
                                    />
                                    <div class="stream-details" style="right: 1vmin">
                                        <span>{battle.value.enemyNickname}</span>
                                        <div class="stats" style="margin-right: 0">
                                            <div class="resource-box lives">
                                                {battle.value.enemyLives}
                                            </div>
                                            <div class="resource-box wins">
                                                {battle.value.enemyWins}/5
                                            </div>
                                            <div class="view-counter">
                                                {formatWhole(enemyViews.value)} Views
                                            </div>
                                        </div>
                                    </div>
                                    <Row class="streamers-container">
                                        <TransitionGroup name="streamer-transition">
                                            {battle.value.enemyStreamers.map((streamer, i) => (
                                                <CharacterSlot
                                                    id={`battle-enemy-streamer-${i}`}
                                                    key={streamer.id}
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
                                <Column class="members-container">
                                    <TransitionGroup name="character-transition">
                                        {battle.value.enemyTeam.map((member, i) => (
                                            <CharacterSlot
                                                id={`battle-enemy-member-${i}`}
                                                character={member}
                                                key={member.id}
                                                shake={
                                                    previewing.value &&
                                                    queue.value[0]?.action === "join" &&
                                                    member ===
                                                        battle.value?.enemyTeam[
                                                            (battle.value?.enemyTeam.length ?? 0) -
                                                                1
                                                        ]
                                                }
                                            />
                                        ))}
                                    </TransitionGroup>
                                    <div style="font-size: 5vmin; margin: 5vmin;">←</div>
                                </Column>
                            </div>
                        </div>
                        {showingOutcome.value ? (
                            <div class="outcome" onClick={() => emit("newTurn")}>
                                <img
                                    src={
                                        outcome.value === "Victory"
                                            ? victoryButton
                                            : outcome.value === "Defeat"
                                            ? defeatButton
                                            : tieButton
                                    }
                                />
                            </div>
                        ) : null}
                        {render(particles)}
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
                    <div
                        class="stream-bg"
                        style={{ backgroundImage: `url("${streamTypeToBG[streamType.value]}")` }}
                    />
                    <h2 class="team-nickname">{nickname.value}</h2>
                    <Row class="manager-header">
                        <div class="resource-box moguls">{gold.value}</div>
                        <div class="resource-box lives">{lives.value}</div>
                        <div class="resource-box wins">{wins.value}/5</div>
                        <div style="flex-grow: 1" />
                        {findingMatch.value ? (
                            <div class="waiting">Finding opposing team...</div>
                        ) : (
                            <img
                                class="startStream"
                                draggable="false"
                                onClick={() => {
                                    emit("stream");
                                    findingMatch.value = true;
                                }}
                                src={startStream}
                            />
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
                    <Row style="margin-top: 2vh" class="no-margin">
                        <Tooltip display={shopTooltip.value}>
                            <div
                                class="reroll"
                                onDragover={e => e.preventDefault()}
                                onClick={handleShop}
                                onDrop={handleShop}
                            >
                                <img src={shopImage.value} />
                                <Node id="reroll" />
                            </div>
                        </Tooltip>
                        <Row class="shop">
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
                    </Row>
                    <Row class="stream-types">
                        <Tooltip display="Moguls persist (still gain 10 after battle)">
                            <div
                                class={{
                                    "stream-type": true,
                                    active: streamType.value === "Game Show",
                                    selected: selectedStreamType.value === "Game Show"
                                }}
                                onClick={clickStreamType("Game Show")}
                            >
                                <img src={show_small} />
                                <span>Show</span>
                            </div>
                        </Tooltip>
                        <Tooltip
                            display={jsx(() => (
                                <>
                                    <i>Stream started</i>: All Coots permanently gain 1
                                    <img src={heart_small} />
                                    <span style="color: red">Relevancy</span>
                                </>
                            ))}
                        >
                            <div
                                class={{
                                    "stream-type": true,
                                    active: streamType.value === "Reaction Stream",
                                    selected: selectedStreamType.value === "Reaction Stream"
                                }}
                                onClick={clickStreamType("Reaction Stream")}
                            >
                                <img src={room_small} />
                                <span>Play</span>
                            </div>
                        </Tooltip>
                        <Tooltip
                            display={jsx(() => (
                                <>
                                    <i>Stream started</i>: All Yard Coots gain 1{" "}
                                    <img src={heart_small} />
                                    <span style="color: red">Relevancy</span> for every Yard Coots
                                    owned, for the rest of the battle
                                </>
                            ))}
                        >
                            <div
                                class={{
                                    "stream-type": true,
                                    active: streamType.value === "Podcast",
                                    selected: selectedStreamType.value === "Podcast"
                                }}
                                onClick={clickStreamType("Podcast")}
                            >
                                <img src={yard_small} />
                                <span>Podcast</span>
                            </div>
                        </Tooltip>
                        <Tooltip
                            display={jsx(() => (
                                <>
                                    <i>Stream started</i>: Give the rightmost Coots 2{" "}
                                    <img src={heart_small} />
                                    <span style="color: red">Relevancy</span> and{" "}
                                    <img src={star_small} />
                                    <span style="color: gold">Presence</span> for the rest of the
                                    battle
                                </>
                            ))}
                        >
                            <div
                                class={{
                                    "stream-type": true,
                                    active: streamType.value === "Cooking Stream",
                                    selected: selectedStreamType.value === "Cooking Stream"
                                }}
                                onClick={clickStreamType("Cooking Stream")}
                            >
                                <img src={kitchen_small} />
                                <span>Cooking</span>
                            </div>
                        </Tooltip>
                        <Tooltip
                            display={jsx(() => (
                                <>
                                    <i>Stream started</i>: Give 1 <img src={heart_small} />
                                    <span style="color: red">Relevancy</span> to the rightmost Coots
                                    for the rest of the battle and deal 2 <img src={heart_small} />
                                    <span style="color: red">Relevancy</span> damage to the leftmost
                                    enemy Coots for the rest of the battle
                                </>
                            ))}
                        >
                            <div
                                class={{
                                    "stream-type": true,
                                    active: streamType.value === "Bro vs Bro",
                                    selected: selectedStreamType.value === "Bro vs Bro"
                                }}
                                onClick={clickStreamType("Bro vs Bro")}
                            >
                                <img src={react_small} />
                                <span>Reaction</span>
                            </div>
                        </Tooltip>
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
        selectedStreamType,
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
        showRefreshAnim,
        hurt,
        streamType
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
                e.playOnceAndDestroy();
            });
        }
    } else {
        timeSinceFirework = 0;
    }
});

function clickCharacter(index: number) {
    return (e?: MouseEvent) => {
        main.selectedStreamType.value = null;
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

function clickStreamType(type: StreamTypes) {
    return (e?: MouseEvent) => {
        if (main.selectedStreamType.value == null || main.selectedStreamType.value !== type) {
            main.selectedStreamType.value = type;
        } else {
            main.selectedStreamType.value = null;
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
