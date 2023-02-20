import{E as y}from"./@socket.io.aec831e2.js";const N=typeof ArrayBuffer=="function",A=e=>typeof ArrayBuffer.isView=="function"?ArrayBuffer.isView(e):e.buffer instanceof ArrayBuffer,p=Object.prototype.toString,E=typeof Blob=="function"||typeof Blob!="undefined"&&p.call(Blob)==="[object BlobConstructor]",d=typeof File=="function"||typeof File!="undefined"&&p.call(File)==="[object FileConstructor]";function a(e){return N&&(e instanceof ArrayBuffer||A(e))||E&&e instanceof Blob||d&&e instanceof File}function u(e,r){if(!e||typeof e!="object")return!1;if(Array.isArray(e)){for(let t=0,n=e.length;t<n;t++)if(u(e[t]))return!0;return!1}if(a(e))return!0;if(e.toJSON&&typeof e.toJSON=="function"&&arguments.length===1)return u(e.toJSON(),!0);for(const t in e)if(Object.prototype.hasOwnProperty.call(e,t)&&u(e[t]))return!0;return!1}function g(e){const r=[],t=e.data,n=e;return n.data=f(t,r),n.attachments=r.length,{packet:n,buffers:r}}function f(e,r){if(!e)return e;if(a(e)){const t={_placeholder:!0,num:r.length};return r.push(e),t}else if(Array.isArray(e)){const t=new Array(e.length);for(let n=0;n<e.length;n++)t[n]=f(e[n],r);return t}else if(typeof e=="object"&&!(e instanceof Date)){const t={};for(const n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=f(e[n],r));return t}return e}function w(e,r){return e.data=l(e.data,r),delete e.attachments,e}function l(e,r){if(!e)return e;if(e&&e._placeholder===!0){if(typeof e.num=="number"&&e.num>=0&&e.num<r.length)return r[e.num];throw new Error("illegal attachments")}else if(Array.isArray(e))for(let t=0;t<e.length;t++)e[t]=l(e[t],r);else if(typeof e=="object")for(const t in e)Object.prototype.hasOwnProperty.call(e,t)&&(e[t]=l(e[t],r));return e}const B=5;var i;(function(e){e[e.CONNECT=0]="CONNECT",e[e.DISCONNECT=1]="DISCONNECT",e[e.EVENT=2]="EVENT",e[e.ACK=3]="ACK",e[e.CONNECT_ERROR=4]="CONNECT_ERROR",e[e.BINARY_EVENT=5]="BINARY_EVENT",e[e.BINARY_ACK=6]="BINARY_ACK"})(i||(i={}));class C{constructor(r){this.replacer=r}encode(r){return(r.type===i.EVENT||r.type===i.ACK)&&u(r)?this.encodeAsBinary({type:r.type===i.EVENT?i.BINARY_EVENT:i.BINARY_ACK,nsp:r.nsp,data:r.data,id:r.id}):[this.encodeAsString(r)]}encodeAsString(r){let t=""+r.type;return(r.type===i.BINARY_EVENT||r.type===i.BINARY_ACK)&&(t+=r.attachments+"-"),r.nsp&&r.nsp!=="/"&&(t+=r.nsp+","),r.id!=null&&(t+=r.id),r.data!=null&&(t+=JSON.stringify(r.data,this.replacer)),t}encodeAsBinary(r){const t=g(r),n=this.encodeAsString(t.packet),o=t.buffers;return o.unshift(n),o}}class h extends y{constructor(r){super(),this.reviver=r}add(r){let t;if(typeof r=="string"){if(this.reconstructor)throw new Error("got plaintext data when reconstructing a packet");t=this.decodeString(r);const n=t.type===i.BINARY_EVENT;n||t.type===i.BINARY_ACK?(t.type=n?i.EVENT:i.ACK,this.reconstructor=new R(t),t.attachments===0&&super.emitReserved("decoded",t)):super.emitReserved("decoded",t)}else if(a(r)||r.base64)if(this.reconstructor)t=this.reconstructor.takeBinaryData(r),t&&(this.reconstructor=null,super.emitReserved("decoded",t));else throw new Error("got binary data when not reconstructing a packet");else throw new Error("Unknown type: "+r)}decodeString(r){let t=0;const n={type:Number(r.charAt(0))};if(i[n.type]===void 0)throw new Error("unknown packet type "+n.type);if(n.type===i.BINARY_EVENT||n.type===i.BINARY_ACK){const s=t+1;for(;r.charAt(++t)!=="-"&&t!=r.length;);const c=r.substring(s,t);if(c!=Number(c)||r.charAt(t)!=="-")throw new Error("Illegal attachments");n.attachments=Number(c)}if(r.charAt(t+1)==="/"){const s=t+1;for(;++t&&!(r.charAt(t)===","||t===r.length););n.nsp=r.substring(s,t)}else n.nsp="/";const o=r.charAt(t+1);if(o!==""&&Number(o)==o){const s=t+1;for(;++t;){const c=r.charAt(t);if(c==null||Number(c)!=c){--t;break}if(t===r.length)break}n.id=Number(r.substring(s,t+1))}if(r.charAt(++t)){const s=this.tryParse(r.substr(t));if(h.isPayloadValid(n.type,s))n.data=s;else throw new Error("invalid payload")}return n}tryParse(r){try{return JSON.parse(r,this.reviver)}catch{return!1}}static isPayloadValid(r,t){switch(r){case i.CONNECT:return typeof t=="object";case i.DISCONNECT:return t===void 0;case i.CONNECT_ERROR:return typeof t=="string"||typeof t=="object";case i.EVENT:case i.BINARY_EVENT:return Array.isArray(t)&&t.length>0;case i.ACK:case i.BINARY_ACK:return Array.isArray(t)}}destroy(){this.reconstructor&&(this.reconstructor.finishedReconstruction(),this.reconstructor=null)}}class R{constructor(r){this.packet=r,this.buffers=[],this.reconPack=r}takeBinaryData(r){if(this.buffers.push(r),this.buffers.length===this.reconPack.attachments){const t=w(this.reconPack,this.buffers);return this.finishedReconstruction(),t}return null}finishedReconstruction(){this.reconPack=null,this.buffers=[]}}var O=Object.freeze(Object.defineProperty({__proto__:null,protocol:B,get PacketType(){return i},Encoder:C,Decoder:h},Symbol.toStringTag,{value:"Module"}));export{i as P,O as p};
