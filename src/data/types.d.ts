import { CoercableComponent } from "features/feature";

type AbilityTypes =
    | "LivestreamJoined"
    | "Sold"
    | "LevelUp"
    | "LivestreamEnded"
    | "StreamStarted"
    | "StartTurn";

interface CharacterInfo {
    nickname: string;
    initialRelevancy: number;
    initialPresence: number;
    display: string;
    abilityType: AbilityTypes;
    abilityDescription: (char: Character) => CoercableComponent;
    performAbility: (char: Character) => void;
}

interface Character {
    type: string;
    exp: number;
    relevancy: number;
    presence: number;
}

type BattleOutcome = "Victory" | "Defeat" | "Tie";

interface ServerToClientEvents {
    "server version": (semver: string) => void;
    nickname: (nickname: string) => void;
    info: (message: string) => void;
    newTurn: (shop: string[]) => void;
    reroll: (shop: string[]) => void;
    buy: (shopIndex: number, teamIndex: number, char: Character) => void;
    move: (index: number, otherIndex: number) => void;
    merge: (shopIndex: number, teamIndex: number, char: Character) => void;
    stream: (
        enemy: {
            team: Character[];
            nickname: string;
            lives: number;
            wins: number;
            turn: number;
        },
        outcome: BattleOutcome
    ) => void;
    freeze: (index: number) => void;
    sell: (index: number) => void;
    room: (room: string) => void;
    "room failed": (err: string) => void;
}

interface ClientToServerEvents {
    buy: (shopIndex: number, teamIndex: number) => void;
    move: (index: number, otherIndex: number) => void;
    merge: (index: number, otherIndex: number) => void;
    freeze: (index: number) => void;
    sell: (index: number) => void;
    reroll: () => void;
    stream: () => void;
    newTurn: () => void;
    "change room": (room: string, password: string) => void;
}
