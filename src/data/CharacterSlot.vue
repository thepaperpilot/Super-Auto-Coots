<template>
    <Tooltip
        :display="character ? characters[character.type].nickname : ''"
        :direction="Direction.Up"
    >
        <div class="character" :class="{ selected, empty: character == null }">
            <span class="character-display" v-if="character != null">
                <img :src="characters[character.type].display" />
            </span>
            <span class="relevancy-display" v-if="character != null">
                <span class="material-icons"> extension </span>
                {{ character?.relevancy }}
            </span>
        </div>
    </Tooltip>
</template>

<script setup lang="ts">
import Tooltip from "features/tooltips/Tooltip.vue";
import { Direction } from "util/common";
import { characters } from "./projEntry";

defineProps<{
    character?: {
        type: string;
        relevancy: number;
    } | null;
    selected?: boolean;
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
</style>
