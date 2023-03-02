<template>
    <Modal v-model="isOpen">
        <template v-slot:header>
            <h2>Settings</h2>
        </template>
        <template v-slot:body>
            <Slider title="BGM Volume" :min="0" :max="1" v-model="bgmVolume" />
            <Slider title="SFX Volume" :min="0" :max="1" v-model="sfxVolume" />
            <component :is="settingFieldsComponent" />
            <Text title="Private room name" v-model="privateRoomName" />
            <Text title="Private room PW" :password="true" v-model="privateRoomPassword" />
            <div>Currently in: {{room ? room : "Public lobby"}}.</div>
            <button class="button" style="padding: 1em" v-if="room !== privateRoomName" @click="joinRoom">Connect to {{privateRoomName || "Public Lobby"}}</button>
            <div style="color: red" v-if="roomConnectionError">{{ roomConnectionError }}</div>
        </template>
    </Modal>
</template>

<script setup lang="tsx">
import Modal from "components/Modal.vue";
import { emit, room, roomConnectionError } from "data/socket";
import { jsx } from "features/feature";
import settings, { settingFields } from "game/settings";
import { save } from "util/save";
import { coerceComponent, render } from "util/vue";
import { computed, ref, toRefs } from "vue";
import Slider from "./fields/Slider.vue";
import Text from "./fields/Text.vue";

const isOpen = ref(false);
const currentTab = ref("behaviour");

function isTab(tab: string): boolean {
    return tab == currentTab.value;
}

function setTab(tab: string) {
    currentTab.value = tab;
}

defineExpose({
    isTab,
    setTab,
    save,
    open() {
        isOpen.value = true;
    }
});

const settingFieldsComponent = computed(() => {
    return coerceComponent(jsx(() => (<>{settingFields.map(render)}</>)));
});

const { privateRoomName, privateRoomPassword, bgmVolume, sfxVolume } = toRefs(settings);

function joinRoom() {
    roomConnectionError.value = "";
    emit("change room", settings.privateRoomName, settings.privateRoomPassword);
}
</script>

<style>
.option-tabs {
    border-bottom: 2px solid var(--outline);
    margin-top: 10px;
    margin-bottom: -10px;
}

.option-tabs button {
    background-color: transparent;
    color: var(--foreground);
    margin-bottom: -2px;
    font-size: 14px;
    cursor: pointer;
    padding: 5px 20px;
    border: none;
    border-bottom: 2px solid var(--foreground);
}

.option-tabs button:not(.selected) {
    border-bottom-color: transparent;
}

.option-title .tooltip-container {
    display: inline;
    margin-left: 5px;
}
.option-title desc {
    display: block;
    opacity: 0.6;
    font-size: small;
    width: 300px;
    margin-left: 0;
}

.save-button {
    text-align: right;
}
</style>
