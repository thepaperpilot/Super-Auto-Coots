interface CharacterInfo {
    nickname: string;
    initialRelevancy: number;
}

interface Character {
    type: string;
    relevancy: number;
}

interface ServerToClientEvents {
    "server version": (semver: string) => void;
    nickname: (nickname: string) => void;
    info: (message: string) => void;
    newTurn: (shop: string[]) => void;
    reroll: (shop: string[]) => void;
    buy: (shopIndex: number, teamIndex: number, char: Character) => void;
}

interface ClientToServerEvents {
    buy: (shopIndex: number, teamIndex: number) => void;
}
