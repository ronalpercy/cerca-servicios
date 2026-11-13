const emergencies = [
  {name:"Policía",number:"105",detail:"Emergencia policial",icon:"🚓"},
  {name:"Bomberos",number:"116",detail:"Incendios y rescates",icon:"🚒"},
  {name:"SAMU",number:"106",detail:"Urgencias médicas*",icon:"🚑"},
  {name:"Línea 100",number:"100",detail:"Violencia familiar y sexual",icon:"🤝"},
  {name:"Carreteras",number:"110",detail:"Policía de carreteras",icon:"🚔"},
  {name:"Defensa Civil",number:"115",detail:"Emergencias y desastres",icon:"🛟"}
];
const defaults = [
  {id:"gob",name:"Portal del Estado Peruano",category:"Otros",phone:"",address:"Trámites e información oficial",note:"Portal oficial de servicios y trámites del Estado.",url:"https://www.gob.pe"},
  {id:"salud",name:"Información de salud - MINSA",category:"Salud",phone:"113",address:"Orientación en salud",note:"Línea de información y orientación en salud.",url:"https://www.gob.pe/minsa"}
];
const icons={Salud:"🩺",Transporte:"🚕",Hogar:"🛠️",Otros:"📌"};
let services=loadServices(), currentFilter="Todos", deferredInstall=null;
const $=id=>document.getElementById(id);
function loadServices(){try{const saved=JSON.parse(localStorage.getItem("cerca-services"));return Array.isArray(saved)?saved:defaults.slice()}catch{return defaults.slice()}}
function save(){localStorage.setItem("cerca-services",JSON.stringify(services))}
function renderEmergencies(){
  $("emergencyGrid").innerHTML=emergencies.map(e=>`<a class="emergency-card" href="tel:${e.number}" aria-label="Llamar a ${e.name}, ${e.number}"><span>${e.icon}</span><span class="number">${e.number}</span><b>${e.name}</b><small>${e.detail}</small></a>`).join("");
}
function renderServices(){
  const query=$("searchInput").value.trim().toLocaleLowerCase("es");
  const filtered=services.filter(s=>(currentFilter==="Todos"||s.category===currentFilter)&&[s.name,s.category,s.phone,s.address,s.note].join(" ").toLocaleLowerCase("es").includes(query));
  $("serviceList").innerHTML=filtered.map(s=>`<article class="service-card"><div class="service-icon">${icons[s.category]||"📌"}</div><div class="service-info"><h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.note||s.address||s.category)}</p><div class="service-meta">${escapeHtml(s.category)}${s.phone?" · "+escapeHtml(s.phone):""}</div><div class="service-actions">${s.phone?`<a class="action-link" href="tel:${encodeURIComponent(s.phone)}">☎ Llamar</a>`:""}${s.url?`<a class="action-link" href="${escapeAttr(s.url)}" target="_blank" rel="noopener">Abrir ↗</a>`:""}${s.address&&!s.url?`<button class="mini-btn" data-map="${escapeAttr(s.address)}">Ver mapa ↗</button>`:""}<button class="mini-btn" data-edit="${escapeAttr(s.id)}">Editar</button><button class="mini-btn" data-delete="${escapeAttr(s.id)}">Eliminar</button></div></div></article>`).join("");
  $("emptyState").hidden=filtered.length!==0;
}
function escapeHtml(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escapeAttr(v=""){return escapeHtml(v)}
function toast(message){const t=$("toast");t.textContent=message;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2300)}
function resetForm(){ $("serviceForm").reset();$("serviceId").value="";$("dialogTitle").textContent="Agregar servicio";}
function openForm(service){resetForm();if(service){$("dialogTitle").textContent="Editar servicio";$("serviceId").value=service.id;$("serviceName").value=service.name;$("serviceCategory").value=service.category;$("servicePhone").value=service.phone||"";$("serviceAddress").value=service.address||"";$("serviceNote").value=service.note||"";} $("serviceDialog").showModal()}
$("addBtn").addEventListener("click",()=>openForm());
$("closeDialog").addEventListener("click",()=>$("serviceDialog").close());
$("cancelBtn").addEventListener("click",()=>$("serviceDialog").close());
$("serviceForm").addEventListener("submit",e=>{
  e.preventDefault();
  const id=$("serviceId").value||("s"+Date.now());
  const item={id,name:$("serviceName").value.trim(),category:$("serviceCategory").value,phone:$("servicePhone").value.trim(),address:$("serviceAddress").value.trim(),note:$("serviceNote").value.trim()};
  if(!item.name){toast("Escribe un nombre para el servicio.");return}
  const index=services.findIndex(s=>s.id===id);if(index>=0)services[index]=item;else services.unshift(item);
  save();renderServices();$("serviceDialog").close();toast(index>=0?"Servicio actualizado":"Servicio guardado en tu dispositivo");
});
$("serviceList").addEventListener("click",e=>{
  const edit=e.target.closest("[data-edit]");const del=e.target.closest("[data-delete]");const map=e.target.closest("[data-map]");
  if(edit){const s=services.find(x=>x.id===edit.dataset.edit);if(s)openForm(s)}
  if(del){const s=services.find(x=>x.id===del.dataset.delete);if(s&&confirm(`¿Eliminar "${s.name}" de tu directorio?`)){services=services.filter(x=>x.id!==s.id);save();renderServices();toast("Servicio eliminado")}}
  if(map){window.open("https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(map.dataset.map),"_blank","noopener")}
});
$("searchInput").addEventListener("input",renderServices);
$("filters").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;currentFilter=b.dataset.filter;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));renderServices()});
$("emergencyNav").addEventListener("click",()=>document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.id==="emergencyNav")));
$("directoryNav").addEventListener("click",()=>document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.id==="directoryNav")));
$("homeNav").addEventListener("click",()=>document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.id==="homeNav")));
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;$("installBtn").hidden=false});
$("installBtn").addEventListener("click",async()=>{if(!deferredInstall){toast("Usa el menú del navegador y elige “Instalar aplicación”.");return}deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$("installBtn").hidden=true});
if("serviceWorker" in navigator && location.protocol!=="file:"){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(err=>console.log("Service worker:",err)))}
renderEmergencies();renderServices();