interface CharacterInfo {
    nickname: string;
    initialRelevancy: number;
    initialPresence: number;
    display: string;
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
    stream: (enemyTeam: (Character | null)[], nickname: string, outcome: BattleOutcome) => void;
}

interface ClientToServerEvents {
    buy: (shopIndex: number, teamIndex: number) => void;
    move: (index: number, otherIndex: number) => void;
    merge: (index: number, otherIndex: number) => void;
    reroll: () => void;
    stream: () => void;
    newTurn: () => void;
}
