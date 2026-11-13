/*! 
Qiskit Fall Fest 2026 @ Palermo

© 2026 — ALL RIGHTS RESERVED, UNLESS OTHERWISE STATED.

ORIGINAL VISUAL IDENTITY, DESIGN, BRANDING, AND CREATIVE CONTENT THIRD-PARTY TRADEMARKS, LOGOS, IMAGES, AND OTHER ASSETS REMAIN THE PROPERTY OF THEIR RESPECTIVE OWNERS.

SOURCE CODE LICENSED UNDER THE APACHE LICENSE 2.0.

SEE THE NOTICE FILE FOR ATTRIBUTION AND APPLICABLE TERMS.

LEARN FROM THE CODE. BUILD UPON IT. CREATE YOUR OWN IDENTITY.
 */
(()=>{"use strict";document.querySelectorAll("[data-share]").forEach(t=>{if(t.dataset.shareReady||!window.bootstrap?.Dropdown)return;t.dataset.shareReady="true";const e=t.querySelector("button"),a=t.querySelector(".dropdown-menu"),r=bootstrap.Dropdown.getOrCreateInstance(e,{boundary:"viewport",popperConfig:t=>({...t,strategy:"fixed"})});let o=!1,n=!1;const s=()=>({title:t.dataset.shareTitle||document.title,url:t.dataset.shareUrl?new URL(t.dataset.shareUrl,window.location.href).href:window.location.href});let i;t.dataset.shareFile&&"function"==typeof navigator.canShare&&"function"==typeof File&&(async()=>{try{const e=await fetch(t.dataset.shareFile);if(!e.ok)return;const a=await e.blob();if(!a.type.startsWith("image/"))return;const r=new URL(t.dataset.shareFile,window.location.href).pathname.split("/").pop();i=new File([a],r,{type:a.type})}catch{}})();const c=()=>{const e=s(),a=encodeURIComponent(e.url),r=encodeURIComponent(e.title),o={facebook:`https://www.facebook.com/sharer/sharer.php?u=${a}`,x:`https://twitter.com/intent/tweet?url=${a}&text=${r}`,whatsapp:`https://api.whatsapp.com/send?text=${encodeURIComponent(`${e.title} ${e.url}`)}`,telegram:`https://t.me/share/url?url=${a}&text=${r}`,email:`mailto:?subject=${r}&body=${a}`};t.querySelectorAll("[data-share-service]").forEach(t=>{t.href=o[t.dataset.shareService]})};e.addEventListener("show.bs.dropdown",t=>{!n||o?t.preventDefault():c()});const l=async(t=!1)=>{if(!o){if(c(),!n&&"function"==typeof navigator.share){o=!0,e.setAttribute("aria-busy","true");try{return void(i&&navigator.canShare({files:[i]})?await navigator.share({files:[i]}):await navigator.share(s()))}catch(t){if("AbortError"===t?.name)return}finally{o=!1,e.removeAttribute("aria-busy")}}n=!0,r.toggle(),t&&a.classList.contains("show")&&a.querySelector("a").focus()}};e.addEventListener("click",t=>{t.preventDefault(),t.stopPropagation(),l(0===t.detail)}),e.addEventListener("keydown",t=>{!n&&["ArrowDown","ArrowUp"].includes(t.key)&&(t.preventDefault(),t.stopPropagation(),l(!0))}),c(),e.disabled=!1})})();