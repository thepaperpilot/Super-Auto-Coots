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
    shop: (shop: string[]) => void;
}

interface ClientToServerEvents {}
