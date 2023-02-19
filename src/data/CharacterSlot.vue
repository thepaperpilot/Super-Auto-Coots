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
                <span class="material-icons"> extension </span>
                {{ character?.relevancy }}
            </span>
            <span class="presence-display" v-if="character != null">
                <span class="material-icons"> extension </span>
                {{ character?.presence }}
            </span>
            <span class="level-display" v-if="character != null">
                <span class="level">{{ level }}</span>
                <span class="segments">
                    <span
                        v-for="i in segments"
                        :key="i"
                        class="segment"
                        :class="{ filled: filledSegments >= i }"
                    >
                    </span>
                </span>
            </span>
        </div>
    </Tooltip>
</template>

<script setup lang="ts">
import Tooltip from "features/tooltips/Tooltip.vue";
import { Direction } from "util/common";
import { computed, watch } from "vue";
import { characters } from "./projEntry";

const props = defineProps<{
    character?: Character | null;
    isSelected?: boolean;
    selected?: Character | null;
}>();

const level = computed(() => {
    const exp = props.character?.exp ?? 0;
    if (exp < 3) {
        return 1;
    }
    if (exp < 6) {
        return 2;
    }
    return 3;
});
const segments = computed(() => {
    const exp = props.character?.exp ?? 0;
    if (exp < 3) {
        return 2;
    }
    return 3;
});
const filledSegments = computed(() => {
    const exp = props.character?.exp ?? 0;
    if (exp < 3) {
        return exp - 1;
    }
    return exp - 3;
});
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

.character-display {
    text-shadow: 3px 3px 5px black;
    width: 100%;
    height: 100%;
}

.character-display img {
    max-width: 100%;
    max-height: 100%;
    aspect-ratio: 1/1;
}

.character::after {
    content: "";
    background: grey;
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    bottom: 0;
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
    transform: scale(1.5);
}

.character:not(.selected):not(.empty):hover::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%2388C0D0' stroke-width='2' stroke-dasharray='10%25%2c90%25' stroke-dashoffset='5' stroke-linecap='square'/%3e%3c/svg%3e");
    transform: scale(1.5);
}

.relevancy-display {
    position: absolute;
    top: 0;
    left: 0;
    color: var(--feature-foreground);
}

.relevancy-display .material-icons {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--accent1);
    font-size: 200%;
    z-index: -1;
}

.presence-display {
    position: absolute;
    top: 0;
    right: 0;
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
    bottom: -10%;
    right: -20%;
    color: var(--accent2);
    font-size: xx-large;
    text-shadow: -1px 1px 0 var(--outline), 1px 1px 0 var(--outline), 1px -1px 0 var(--outline),
        -1px -1px 0 var(--outline);
}

.level {
    background: var(--locked);
    border-radius: 4px;
    border-top-left-radius: 50%;
    border-bottom-left-radius: 0;
    border: solid 2px var(--raised-background);
    padding-left: 4px;
    padding-right: 4px;
}

.level,
.level::before {
    font-family: "Mynerve", cursive;
}

.level::before {
    content: "lv";
    font-size: large;
}

.segments {
    position: absolute;
    right: calc(100% - 2px);
    width: 100%;
    height: 25%;
    bottom: -2px;
    background: var(--locked);
    border-radius: 20px 0 0 0;
    border: solid 2px var(--raised-background);
    display: flex;
    overflow: hidden;
}

.segment {
    width: 100%;
    height: 100%;
}

.segment:not(:last-child) {
    border-right: solid 3px var(--raised-background);
}

.segment.filled {
    background-color: var(--accent2);
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
