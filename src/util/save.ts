import projInfo from "data/projInfo.json";
import { globalBus } from "game/events";
import type { Player } from "game/player";
import player, { stringifySave } from "game/player";
import settings, { loadSettings } from "game/settings";
import LZString from "lz-string";
import { ref } from "vue";

export function setupInitialStore(player: Partial<Player> = {}): Player {
    return Object.assign(
        {
            id: `${projInfo.id}-0`,
            name: "Default Save",
            tabs: projInfo.initialTabs.slice(),
            time: Date.now(),
            autosave: true,
            offlineProd: true,
            offlineTime: 0,
            timePlayed: 0,
            keepGoing: false,
            modID: projInfo.id,
            modVersion: projInfo.versionNumber,
            layers: {}
        },
        player
    ) as Player;
}

export function save(playerData?: Player): string {
    const stringifiedSave = LZString.compressToUTF16(stringifySave(playerData ?? player));
    localStorage.setItem((playerData ?? player).id, stringifiedSave);
    return stringifiedSave;
}

export async function load(): Promise<void> {
    // Load global settings
    loadSettings();

    try {
        let save = localStorage.getItem(settings.active);
        if (save == null) {
            await loadSave(newSave());
            return;
        }
        if (save[0] === "{") {
            // plaintext. No processing needed
        } else if (save[0] === "e") {
            // Assumed to be base64, which starts with e
            save = decodeURIComponent(escape(atob(save)));
        } else if (save[0] === "ᯡ") {
            // Assumed to be lz, which starts with ᯡ
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            save = LZString.decompressFromUTF16(save)!;
        } else {
            throw `Unable to determine save encoding`;
        }
        const player = JSON.parse(save);
        if (player.modID !== projInfo.id) {
            await loadSave(newSave());
            return;
        }
        player.id = settings.active;
        await loadSave(player);
    } catch (e) {
        console.error("Failed to load save. Falling back to new save.\n", e);
        await loadSave(newSave());
    }
}

export function newSave(): Player {
    const id = getUniqueID();
    const player = setupInitialStore({ id });
    save(player);

    settings.saves.push(id);

    return player;
}

export function getUniqueID(): string {
    let id,
        i = 0;
    do {
        id = `${projInfo.id}-${i++}`;
    } while (localStorage.getItem(id) != null);
    return id;
}

export const loadingSave = ref(false);

export async function loadSave(playerObj: Partial<Player>): Promise<void> {
    console.info("Loading save", playerObj);
    loadingSave.value = true;
    const { layers, removeLayer, addLayer } = await import("game/layers");
    const { fixOldSave, getInitialLayers } = await import("data/projEntry");

    for (const layer in layers) {
        const l = layers[layer];
        if (l) {
            removeLayer(l);
        }
    }
    getInitialLayers(playerObj).forEach(layer => addLayer(layer, playerObj));

    playerObj = setupInitialStore(playerObj);
    if (
        playerObj.offlineProd &&
        playerObj.time != null &&
        playerObj.time &&
        playerObj.devSpeed !== 0
    ) {
        if (playerObj.offlineTime == undefined) playerObj.offlineTime = 0;
        playerObj.offlineTime += Math.min(
            playerObj.offlineTime + (Date.now() - playerObj.time) / 1000,
            projInfo.offlineLimit * 3600
        );
    }
    playerObj.time = Date.now();
    if (playerObj.modVersion !== projInfo.versionNumber) {
        fixOldSave(playerObj.modVersion, playerObj);
        playerObj.modVersion = projInfo.versionNumber;
    }

    Object.assign(player, playerObj);
    settings.active = player.id;

    globalBus.emit("onLoad");
}

setInterval(() => {
    if (player.autosave) {
        save();
    }
}, 1000);
window.onbeforeunload = () => {
    if (player.autosave) {
        save();
    }
};

declare global {
    /**
     * Augment the window object so the save, hard reset, and deleteLowerSaves functions can be accessed from the console.
     */
    interface Window {
        save: VoidFunction;
        hardReset: VoidFunction;
        deleteLowerSaves: VoidFunction;
    }
}
window.save = save;
export const hardReset = (window.hardReset = async () => {
    await loadSave(newSave());
});
export const deleteLowerSaves = (window.deleteLowerSaves = () => {
    const index = Object.values(settings.saves).indexOf(player.id) + 1;
    Object.values(settings.saves)
        .slice(index)
        .forEach(id => localStorage.removeItem(id));
    settings.saves = settings.saves.slice(0, index);
});
