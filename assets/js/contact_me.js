/*! SOURCE CODE LICENSED UNDER THE APACHE LICENSE 2.0.

ORIGINAL VISUAL IDENTITY, DESIGN, BRANDING, AND CREATIVE CONTENT
© 2026 — ALL RIGHTS RESERVED, UNLESS OTHERWISE STATED.

THIRD-PARTY TRADEMARKS, LOGOS, IMAGES, AND OTHER ASSETS REMAIN THE PROPERTY OF THEIR RESPECTIVE OWNERS.
SEE THE NOTICE FILE FOR ATTRIBUTION AND APPLICABLE TERMS.

LEARN FROM THE CODE. BUILD UPON IT. CREATE YOUR OWN IDENTITY. */
document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("contactForm");if(!e)return;const t=document.getElementById("success"),a=e.querySelector('[type="submit"]'),n=(e,a)=>{t.replaceChildren();const n=document.createElement("div");n.className=`alert alert-${e} alert-dismissible fade show`,n.setAttribute("role","alert");const s=document.createElement("strong");s.textContent=a,n.append(s);const o=document.createElement("button");o.type="button",o.className="btn-close",o.dataset.bsDismiss="alert",o.setAttribute("aria-label","Close"),n.append(o),t.append(n)};e.addEventListener("submit",async t=>{if(t.preventDefault(),t.stopPropagation(),e.classList.add("was-validated"),e.checkValidity()){a.disabled=!0;try{const t=await fetch(e.action,{method:"POST",body:new FormData(e),headers:{Accept:"application/json"}});if(!t.ok)throw new Error(`Contact endpoint returned HTTP ${t.status}`);n("success","Your message has been sent."),e.reset(),e.classList.remove("was-validated")}catch(e){console.error("Unable to submit the contact form.",e),n("danger","The message could not be sent. Please try again later.")}finally{a.disabled=!1}}}),e.addEventListener("input",()=>t.replaceChildren(),{once:!0})});