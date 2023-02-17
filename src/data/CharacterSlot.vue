<template>
    <div class="character">
        <span class="character-display">{{ character?.type }}</span>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    character?: {
        type: string;
        relevancy: number;
    };
}>();
</script>

<style scoped>
.character {
    width: 8vw;
    height: 8vw;
    position: relative;
    margin: 50px;
    justify-content: center;
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
</style>
