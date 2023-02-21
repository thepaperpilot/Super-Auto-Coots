<template>
    <Tooltip
        :display="comp"
        :direction="Direction.Up"
    >
        <div
            class="character"
            :class="{
                selected: isSelected,
                empty: character == null && selected == null,
                dragging,
                isDragging,
                draggingOver,
                shake
            }"
            draggable="true"
            :ondragstart="() => (dragging = true)"
            :ondragend="() => (dragging = false)"
            :ondragenter="() => (draggingOver = true)"
            :ondragleave="() => (draggingOver = false)"
            :ondragover="(e: MouseEvent) => {
                // Copied from the v-if clauses on both move indicators
                if (selected != null && !isShop && (character?.type !== selected.type || isSelected)) {
                    e.preventDefault();
                }
                if (character != null &&
                    selected != null &&
                    !isSelected &&
                    character.type === selected.type &&
                    character.exp < 6) {
                    e.preventDefault();
                }
            }"
            :ondrop="
                () => {
                    draggingOver = false;
                    emits('drop');
                }
            "
        >
            <span
                class="move-indicator"
                v-if="
                    selected != null &&
                    !isShop &&
                    (character?.type !== selected.type || isSelected) &&
                    dragging === false
                "
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
            <div v-if="frozen" class="frozen" />
            <Node v-if="id" :id="id" />
        </div>
    </Tooltip>
</template>

<script setup lang="tsx">
import Node from "components/Node.vue";
import { jsx, JSXFunction } from "features/feature";
import Tooltip from "features/tooltips/Tooltip.vue";
import { Direction } from "util/common";
import { coerceComponent } from "util/vue";
import { ref, shallowRef, watch, watchEffect } from "vue";
import heart from "../../public/heart.png";
import level1_0 from "../../public/Lvl 1_0.png";
import level1_1 from "../../public/Lvl 1_1.png";
import level2_0 from "../../public/Lvl 2_0.png";
import level2_1 from "../../public/Lvl 2_1.png";
import level2_2 from "../../public/Lvl 2_2.png";
import level3 from "../../public/Lvl 3.png";
import { characters } from "./projEntry";
import { Character } from "./types";

const props = defineProps<{
    id?: string;
    character?: Character | null;
    isSelected?: boolean;
    isShop?: boolean;
    isDragging?: boolean;
    selected?: Character | null;
    shake?: boolean;
    frozen?: boolean;
}>();

const dragging = ref(false);
const draggingOver = ref(false);

const emits = defineEmits<{
    (e: "dragstart"): void;
    (e: "dragend"): void;
    (e: "drop"): void;
}>();
watch(dragging, dragging => {
    if (dragging) {
        emits("dragstart");
    } else {
        emits("dragend");
    }
});

const comp = shallowRef<JSXFunction | "">("");
watchEffect(() => {
    if (props.character == null || props.selected != null || dragging.value) {
        comp.value = "";
        return;
    }
    const Ability = coerceComponent(characters[props.character.type].abilityDescription(props.character));
    comp.value = jsx(() => (<><b>{characters[props.character!.type].nickname}</b><br /><Ability /></>));
})
</script>

<style scoped>
.character {
    width: 10vmin;
    height: 10vmin;
    position: relative;
    margin: 4vmin;
    justify-content: center;
    user-select: none;
    display: flex;
}

.character:not(.empty) {
    cursor: pointer;
}

.character.shake {
    animation: shake 0.5s infinite;
}

.character * {
    pointer-events: none;
}

.character-display img {
    image-rendering: pixelated;
    width: 10vmin;
    height: 10vmin;
    filter: drop-shadow(2px 4px 6px black);
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

.character.selected:not(.dragging)::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%2388C0D0' stroke-width='8' stroke-dasharray='10%25%2c90%25' stroke-dashoffset='5%25' stroke-linecap='square'/%3e%3c/svg%3e");
    z-index: 1;
}

.character:not(.selected):not(.empty):not(.dragging):not(.isDragging):hover::before,
.character:not(.selected):not(.empty):not(.dragging).draggingOver::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%2388C0D0' stroke-width='4' stroke-dasharray='10%25%2c90%25' stroke-dashoffset='5%25' stroke-linecap='square'/%3e%3c/svg%3e");
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
    width: 10vmin;
    height: 10vmin;
    image-rendering: pixelated;
}

.relevancy-display span {
    font-family: "Roboto Mono";
    font-size: 2vmin;
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
    font-size: 2vmin;
    z-index: -1;
}

.level-display {
    position: absolute;
    bottom: -5%;
    right: -5%;
    z-index: 1;
    transform: translate(50%, 50%);
}

.level-display img {
    width: 10vmin;
    height: 10vmin;
}

.move-indicator {
    position: absolute;
    transform: translateX(-50%) rotate(180deg);
    top: -75%;
    left: 50%;
    animation: bouncingMoveIndicator 1s infinite;
}
.move-indicator .material-icons {
    font-size: 5vmin;
    transition: all 0.5s ease, color 0s;
}

.character:not(.isDragging):hover .move-indicator .material-icons,
.character.draggingOver .move-indicator .material-icons {
    color: var(--feature-foreground);
}

.frozen {
    position: absolute;
    background: skyblue;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.5;
    transform: rotate(45deg);
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

@keyframes shake {
    0% {
        transform: translate(1px, 1px) rotate(0deg);
    }
    10% {
        transform: translate(-1px, -2px) rotate(-1deg);
    }
    20% {
        transform: translate(-3px, 0px) rotate(1deg);
    }
    30% {
        transform: translate(3px, 2px) rotate(0deg);
    }
    40% {
        transform: translate(1px, -1px) rotate(1deg);
    }
    50% {
        transform: translate(-1px, 2px) rotate(-1deg);
    }
    60% {
        transform: translate(-3px, 1px) rotate(0deg);
    }
    70% {
        transform: translate(3px, 1px) rotate(-1deg);
    }
    80% {
        transform: translate(-1px, -1px) rotate(1deg);
    }
    90% {
        transform: translate(1px, 2px) rotate(0deg);
    }
    100% {
        transform: translate(1px, -2px) rotate(-1deg);
    }
}
</style>
