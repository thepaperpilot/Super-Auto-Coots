<template>
    <div class="character" :class="{ selected }">
        <span class="character-display">{{ character?.type }}</span>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
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
    cursor: pointer;
    user-select: none;
}

.character-display {
    text-shadow: 3px 3px 5px black;
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
</style>
