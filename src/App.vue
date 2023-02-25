<template>
    <div id="modal-root" :style="theme" />
    <div class="app" :style="theme" :class="{ useHeader }">
        <Nav v-if="useHeader" />
        <Game />
        <GameOverScreen />
        <NaNScreen />
        <component :is="gameComponent" />
        <Modal v-model="showTutorial">
            <template v-slot:header>Information</template>
            <template v-slot:body>
                <component :is="comp" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="tsx">
import "@fontsource/roboto-mono";
import Modal from "components/Modal.vue";
import { jsx } from "features/feature";
import { createTabFamily } from "features/tabs/tabFamily";
import { coerceComponent, render, renderJSX } from "util/vue";
import { computed, CSSProperties, toRef } from "vue";
import heart from "../public/heart_small.png";
import star from "../public/presence_small.png";
import wins from "../public/wins_small.png";
import money from "../public/money_small.png";
import Game from "./components/Game.vue";
import GameOverScreen from "./components/GameOverScreen.vue";
import NaNScreen from "./components/NaNScreen.vue";
import Nav from "./components/Nav.vue";
import projInfo from "./data/projInfo.json";
import themes from "./data/themes";
import settings, { gameComponents } from "./game/settings";
import "./main.css";

const useHeader = projInfo.useHeader;
const theme = computed(() => themes[settings.theme].variables as CSSProperties);
const showTPS = toRef(settings, "showTPS");
const showTutorial = toRef(settings, "showTutorial");

const gameComponent = computed(() => {
    return coerceComponent(jsx(() => (<>{gameComponents.map(render)}</>)));
});

const tutorialTabs = createTabFamily({
    general: () => ({
        display: "General",
        glowColor(): string {
            return tutorialTabs.activeTab.value === this.tab ? "var(--foreground)" : ""
        },
        tab: jsx(() => <div>Have you ever played Super Auto Pets? Great, then you already know the basics! I'd suggest checking out the Livestream tab because it's quite different!<br/><br/>For those unfamiliar with SAP, this is a game in which you'll manage a team of Coots that have a series of livestream battles with other player's teams of Coots. You win the game by winning 5 <img src={wins} /><span style="color: cadetblue">trophies</span> before losing all 3 <img src={heart} /><span style="color: red">lives</span>.</div>)
    }),
    managing: () => ({
        display: "Managing",
        glowColor(): string {
            return tutorialTabs.activeTab.value === this.tab ? "var(--foreground)" : ""
        },
        tab: jsx(() => <div>Before each battle you get the opportunity to prepare. You have 3 slots for Coots, and you can buy more using the shop at the bottom of the screen. Purchasing Coots costs <img src={money} /><span style="color: yellow">moguls</span>, which is a currency you receive 10 of during the management phase. Any unspent <img src={money} /><span style="color: yellow">moguls</span> are lost. Each Coots costs 3 <img src={money} /><span style="color: yellow">moguls</span>, and you can reroll the shop for 1 <img src={money} /><span style="color: yellow">mogul</span>.<br/>
            <br/>You can also merge your Coots to increase their stats and level them up. Coots have an ability that grows stronger as they level up.</div>)
    }),
    livestream: () => ({
        display: "Livestream",
        glowColor(): string {
            return tutorialTabs.activeTab.value === this.tab ? "var(--foreground)" : ""
        },
        tab: jsx(() => <div>In a livestream battle, your goal is to get more views than your opponent. Each team will add their Coots to their livestreams together, one at a time. Abilities will also activate throughout the stream so long as both their stats are above 0.<br/><br/>Each Coots has two stats- <img src={heart} /><span style="color: red">Relevancy</span> and <img src={star} /><span style="color: gold">Presence</span>. The view count is based on the product of those two stats, and then summed between each Coots on the stream. Be careful if either stat becomes 0 or lower, that streamer won't contribute to your view count.<br/><br/>You can press play to perform a single action and see what the next will be, or select autoplay to automatically perform the whole match. If this is your first time playing, I'd suggest leaving autoplay off.</div>)
    }),
    multiplayer: () => ({
        display: "Multiplayer",
        glowColor(): string {
            return tutorialTabs.activeTab.value === this.tab ? "var(--foreground)" : ""
        },
        tab: jsx(() => <div>By default you are going to be playing in a shared lobby with all other players. If you'd like to play with a specific group of friends, there's an option to join a room in the settings.<br/><br/>Also, be warned that the game has no account system and if you lose your connection to the server you'll automatically start a new game. Sorry!</div>)
    })
}, () => ({
    classes: { "tutorial": true }
}));
const comp = coerceComponent(jsx(() => renderJSX(tutorialTabs)));
</script>

<style scoped>
.app {
    background-color: var(--background);
    color: var(--foreground);
    display: flex;
    flex-flow: column;
    min-height: 100%;
    height: 100%;
}

#modal-root {
    position: absolute;
    min-height: 100%;
    height: 100%;
    color: var(--foreground);
}
</style>
<style>
.tutorial img {
    height: 1em;
    padding-right: 0.5em;
}
</style>
