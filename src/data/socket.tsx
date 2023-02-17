import Text from "components/fields/Text.vue";
import projInfo from "data/projInfo.json";
import { jsx, setDefault } from "features/feature";
import { globalBus } from "game/events";
import { registerSettingField } from "game/settings";
import satisfies from "semver/functions/satisfies";
import { io, Socket } from "socket.io-client";
import { ref, watch } from "vue";
import { useToast } from "vue-toastification";
import { characters, main } from "./projEntry";

export const connected = ref<boolean>(false);
export const nickname = ref<string>("");

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

function setupSocket(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
    socket.on("connect", () => {
        connectionError.value = "";
        connected.value = true;
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
    });
    socket.on("nickname", nick => {
        nickname.value = nick;
    });

    socket.on("newTurn", shop => {
        main.gold.value = 10;
        main.turn.value++;
        main.shop.value = shop;
    });
    socket.on("reroll", shop => {
        main.shop.value = shop;
    });
    socket.on("buy", (shopIndex, teamIndex, char) => {
        main.team.value[teamIndex] = char;
        main.shop.value[shopIndex] = null;
        main.gold.value -= 3;
    });
    socket.on("move", (index, otherIndex) => {
        const temp = main.team.value[index];
        main.team.value[index] = main.team.value[otherIndex];
        main.team.value[otherIndex] = temp;
    });
}

declare module "game/settings" {
    interface Settings {
        server: string;
    }
}
