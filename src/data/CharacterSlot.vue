<template>
    <Tooltip
        :display="character && selected == null ? characters[character.type].nickname : ''"
        :direction="Direction.Up"
    >
        <div
            class="character"
            :class="{ selected: isSelected, empty: character == null && selected == null }"
        >
            <span
                class="move-indicator"
                v-if="(character == null && selected != null) || isSelected"
            >
                <span class="material-icons">straight</span></span
            >
            <span
                class="move-indicator"
                v-if="
                    character != null &&
                    selected != null &&
                    !isSelected &&
                    character.type === selected.type &&
                    character.exp < 6
                "
                ><span class="material-icons">merge</span></span
            >
            <span class="character-display" v-if="character != null">
                <img :src="characters[character.type].display" />
            </span>
            <span class="relevancy-display" v-if="character != null">
                <img :src="heart" />
                <span>{{ character?.relevancy }}</span>
            </span>
            <span class="presence-display" v-if="character != null">
                <span class="material-icons"> extension </span>
                <span>{{ character?.presence }}</span>
            </span>
            <span class="level-display" v-if="character != null">
                <img :src="level1_0" v-if="character.exp === 1" />
                <img :src="level1_1" v-if="character.exp === 2" />
                <img :src="level2_0" v-if="character.exp === 3" />
                <img :src="level2_1" v-if="character.exp === 4" />
                <img :src="level2_2" v-if="character.exp === 5" />
                <img :src="level3" v-if="character.exp === 6" />
            </span>
        </div>
    </Tooltip>
</template>

<script setup lang="ts">
import Tooltip from "features/tooltips/Tooltip.vue";
import { Direction } from "util/common";
import { characters } from "./projEntry";
import heart from "../../public/Heart.png";
import level1_0 from "../../public/Lvl 1_0.png";
import level1_1 from "../../public/Lvl 1_1.png";
import level2_0 from "../../public/Lvl 2_0.png";
import level2_1 from "../../public/Lvl 2_1.png";
import level2_2 from "../../public/Lvl 2_2.png";
import level3 from "../../public/Lvl 3.png";

defineProps<{
    character?: Character | null;
    isSelected?: boolean;
    selected?: Character | null;
}>();
</script>

<style scoped>
.character {
    width: 8vw;
    height: 8vw;
    position: relative;
    margin: 50px;
    justify-content: center;
    user-select: none;
    display: flex;
}

.character:not(.empty) {
    cursor: pointer;
}

.character-display img {
    image-rendering: pixelated;
    width: 8vw;
    height: 8vw;
}

.character::after {
    content: "";
    background: grey;
    position: absolute;
    top: 67.5%;
    left: 0;
    right: 0;
    bottom: -12.5%;
    border-radius: 50%;
    z-index: -1;
}

.character.selected::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%2388C0D0' stroke-width='8' stroke-dasharray='10%25%2c90%25' stroke-dashoffset='5' stroke-linecap='square'/%3e%3c/svg%3e");
    z-index: 1;
}

.character:not(.selected):not(.empty):hover::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%2388C0D0' stroke-width='4' stroke-dasharray='10%25%2c90%25' stroke-dashoffset='5' stroke-linecap='square'/%3e%3c/svg%3e");
    z-index: 1;
}

.relevancy-display {
    position: absolute;
    top: -15%;
    left: 0;
    transform: translate(-50%, -50%);
}

.relevancy-display img {
    position: absolute;
    transform: translate(-45%, -45%);
    z-index: -1;
    width: 8vw;
    height: 8vw;
    image-rendering: pixelated;
}

.relevancy-display span {
    font-family: "Roboto Mono";
    font-size: large;
    color: white;
    text-shadow: -1px 1px 0 black, 1px 1px 0 black, 1px -1px 0 black, -1px -1px 0 black;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.presence-display {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(-50%, -50%);
    color: var(--feature-foreground);
}

.presence-display .material-icons {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--accent1);
    font-size: 200%;
    z-index: -1;
}

.level-display {
    position: absolute;
    bottom: -15%;
    right: -5%;
    transform: translate(50%, 50%);
}

.level-display img {
    width: 8vw;
    height: 8vw;
}

.move-indicator {
    position: absolute;
    transform: translateX(-50%) rotate(180deg);
    top: -75%;
    left: 50%;
    font-size: xxx-large;
    animation: bouncingMoveIndicator 1s infinite;
}
.move-indicator .material-icons {
    font-size: xxx-large;
    transition: all 0.5s ease, color 0s;
}

.character:hover .move-indicator .material-icons {
    color: var(--feature-foreground);
}

@keyframes bouncingMoveIndicator {
    0% {
        transform: translateX(-50%) rotate(180deg) translateY(0%);
    }
    50% {
        transform: translateX(-50%) rotate(180deg) translateY(50%);
    }
    100% {
        transform: translateX(-50%) rotate(180deg) translateY(0%);
    }
}
</style>
