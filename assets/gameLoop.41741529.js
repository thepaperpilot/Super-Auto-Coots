import{_ as d,s,p as e,a as n,l as T,D as r,b as l,g as u}from"./index.ec3aa6b1.js";import"./vue.f6263579.js";import{b1 as c}from"./@vue.4ce677c2.js";/* empty css                    */import"./nanoevents.1080beb7.js";import"./lz-string.f2f3b7cf.js";import"./vuedraggable.c3acdf62.js";import"./earcut.b6f90e68.js";import"./sortablejs.cbae5b2d.js";import"./vue-next-select.0dc4e443.js";import"./vue-textarea-autosize.35804eaf.js";import"./@pixi.1eac1889.js";import"./ismobilejs.5c6954b9.js";import"./eventemitter3.dc5195d7.js";import"./url.e51cb87b.js";import"./querystring.23ae9a54.js";import"./semver.83ff78cf.js";import"./lru-cache.9a21e90b.js";import"./yallist.fd762fe7.js";import"./socket.io-client.79ce0df5.js";import"./engine.io-client.58517560.js";import"./engine.io-parser.3f360695.js";import"./@socket.io.aec831e2.js";import"./socket.io-parser.544e37d1.js";import"./vue-toastification.b7cd620e.js";import"./workbox-window.8d14e8b7.js";let o=null,m=null;function f(){const t=Date.now();let i=(t-e.time)/1e3;e.time=t;const a=i;if(n.lastTenTicks.push(a),n.lastTenTicks.length>10&&(n.lastTenTicks=n.lastTenTicks.slice(1)),!((m==null?void 0:m.value)&&!e.keepGoing)&&!n.hasNaN&&(i=Math.max(i,0),e.devSpeed!==0)){if(T.value=!1,e.offlineTime!=null){if(r.gt(e.offlineTime,l.offlineLimit*3600)&&(e.offlineTime=l.offlineLimit*3600),r.gt(e.offlineTime,0)&&e.devSpeed!==0){const p=Math.max(e.offlineTime/10,i);e.offlineTime=e.offlineTime-p,i+=p}else e.devSpeed===0&&(e.offlineTime+=i);(!e.offlineProd||r.lt(e.offlineTime,0))&&(e.offlineTime=null)}i=Math.min(i,l.maxTickLength),e.devSpeed!=null&&(i*=e.devSpeed),Number.isFinite(i)||(i=1e308),!r.eq(i,0)&&(e.timePlayed+=i,Number.isFinite(e.timePlayed)||(e.timePlayed=1e308),u.emit("update",i,a),s.unthrottled?(requestAnimationFrame(f),o!=null&&(clearInterval(o),o=null)):o==null&&(o=setInterval(f,50)))}}async function W(){m=(await d(()=>import("./index.ec3aa6b1.js").then(function(t){return t.c}),["assets/index.ec3aa6b1.js","assets/index.53c35225.css","assets/@fontsource.f66d05e7.css","assets/vue.f6263579.js","assets/earcut.b6f90e68.js","assets/@vue.4ce677c2.js","assets/nanoevents.1080beb7.js","assets/lz-string.f2f3b7cf.js","assets/vuedraggable.c3acdf62.js","assets/sortablejs.cbae5b2d.js","assets/vue-next-select.0dc4e443.js","assets/vue-next-select.9e6f4164.css","assets/vue-textarea-autosize.35804eaf.js","assets/@pixi.1eac1889.js","assets/ismobilejs.5c6954b9.js","assets/eventemitter3.dc5195d7.js","assets/url.e51cb87b.js","assets/querystring.23ae9a54.js","assets/semver.83ff78cf.js","assets/lru-cache.9a21e90b.js","assets/yallist.fd762fe7.js","assets/socket.io-client.79ce0df5.js","assets/engine.io-client.58517560.js","assets/engine.io-parser.3f360695.js","assets/@socket.io.aec831e2.js","assets/socket.io-parser.544e37d1.js","assets/vue-toastification.b7cd620e.js","assets/vue-toastification.4b5f8ac8.css","assets/workbox-window.8d14e8b7.js"])).hasWon,c(m,t=>{t&&u.emit("gameWon")}),s.unthrottled?requestAnimationFrame(f):o=setInterval(f,50)}export{W as startGameLoop};
