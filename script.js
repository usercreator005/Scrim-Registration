// ===== CONFIG =====
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzrELcygF9FZVkNAlQoRHSB4ZyWAUdPBjtiT1f2c-F9SM7-8H3WbgOH4qJQ2tglwobm/exec";
const MATCHES = ["12:00 PM", "3:00 PM", "9:00 PM"];
const FEES = [20, 25, 30];
const TOTAL_SLOTS = 12;

// ===== LOCAL STORAGE FOR SLOTS =====
let usedSlots = JSON.parse(localStorage.getItem("usedSlots")) || {
  "12:00 PM": {20:0,25:0,30:0},
  "3:00 PM": {20:0,25:0,30:0},
  "9:00 PM": {20:0,25:0,30:0}
};

let selectedMatch = null;
let selectedFee = null;

// ===== MATCH SELECTION =====
function selectMatch(match){
  selectedMatch = match;
  selectedFee = null;
  document.getElementById("feeBox").classList.remove("hidden");
  document.getElementById("details").classList.add("hidden");
  updateSlotText();
  updateFeeSlots();
}

// ===== FEE SELECTION =====
function selectFee(fee){
  if(!selectedMatch){
    alert("❌ Select match first");
    return;
  }

  const left = TOTAL_SLOTS - usedSlots[selectedMatch][fee];
  if(left <= 0){
    alert(`❌ ₹${fee} Lobby is full`);
    return;
  }

  selectedFee = fee;
  updateSlotText();
  document.getElementById("details").classList.remove("hidden");
}

// ===== UPDATE SLOT TEXT =====
function updateSlotText(){
  const slotText = document.getElementById("slotText");
  if(selectedMatch && selectedFee){
    const left = TOTAL_SLOTS - usedSlots[selectedMatch][selectedFee];
    slotText.innerHTML = `Match: ${selectedMatch} | Fee: ₹${selectedFee} | Slots left: <b>${left}</b>`;
  } else if(selectedMatch){
    slotText.innerText = `Match selected: ${selectedMatch}. Choose entry fee`;
  } else {
    slotText.innerText = "Select match time to continue";
  }
}

// ===== UPDATE FEE SLOT COUNTERS =====
function updateFeeSlots(){
  FEES.forEach(fee=>{
    const span = document.getElementById("slot"+fee);
    if(span && selectedMatch){
      const left = TOTAL_SLOTS - usedSlots[selectedMatch][fee];
      span.innerText = `${left} slots left`;
    }
  });
}

// ===== COPY UPI =====
function copyUPI(){
  const upi = document.getElementById("upi");
  navigator.clipboard.writeText(upi.innerText);
  alert("✅ UPI copied");
}

// ===== SCREENSHOT PREVIEW =====
document.getElementById("ss").addEventListener("change", e=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    const img = document.getElementById("preview");
    img.src = reader.result;
    img.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

// ===== SUBMIT REGISTRATION =====
function submitForm(){
  const team = document.getElementById("team").value.trim();
  const wp = document.getElementById("wp").value.trim();
  const ss = document.getElementById("ss").files[0];

  if(!team || !wp || !ss || !selectedMatch || !selectedFee){
    alert("❌ Fill all details");
    return;
  }

  const form = new FormData();
  form.append("team", team);
  form.append("whatsapp", wp);
  form.append("match", selectedMatch);
  form.append("entryFee", selectedFee);
  form.append("screenshot", ss);

  fetch(WEB_APP_URL, { method:"POST", body:form })
    .then(res=>res.json())
    .then(data=>{
      if(data.success){
        usedSlots[selectedMatch][selectedFee]++;
        localStorage.setItem("usedSlots", JSON.stringify(usedSlots));
        updateFeeSlots();
        showSuccess();
        updateAdminDashboard();
      } else {
        alert("❌ Server error, try again");
      }
    })
    .catch(err=>{
      console.error(err);
      alert("❌ Network error");
    });
}

// ===== SHOW SUCCESS =====
function showSuccess(){
  document.getElementById("details").classList.add("hidden");
  document.getElementById("success").classList.remove("hidden");
}

// ===== GO HOME =====
function goHome(){
  document.getElementById("success").classList.add("hidden");
  document.getElementById("team").value="";
  document.getElementById("wp").value="";
  document.getElementById("ss").value="";
  document.getElementById("preview").classList.add("hidden");
  selectedMatch=null;
  selectedFee=null;
  updateSlotText();
  window.scrollTo({top:0, behavior:"smooth"});
}

// ===== ADMIN DASHBOARD =====
function updateAdminDashboard(){
  const dash = document.getElementById("adminDashboard");
  dash.innerHTML = "";
  MATCHES.forEach(match=>{
    const div = document.createElement("div");
    div.classList.add("admin-box");
    div.innerHTML = `<h4>${match}</h4>`;
    FEES.forEach(fee=>{
      const used = usedSlots[match][fee];
      const left = TOTAL_SLOTS - used;
      const p = document.createElement("p");
      p.innerText = `₹${fee} Lobby: ${used}/${TOTAL_SLOTS} used | ${left} left`;
      div.appendChild(p);
    });
    dash.appendChild(div);
  });
}

// ===== CANCEL / REFUND =====
function cancelRegistration(team, match, fee){
  const now = new Date();
  let hour = parseInt(match.split(/[: ]/)[0]);
  const min = 0;
  if(match.includes("PM") && hour!=12) hour+=12;
  const matchDate = new Date();
  matchDate.setHours(hour,min,0,0);
  const diff = (matchDate-now)/1000/60; // minutes

  if(diff < 60){
    alert("⛔ Refund not allowed within 1 hr of match");
    return;
  }

  usedSlots[match][fee]--;
  localStorage.setItem("usedSlots", JSON.stringify(usedSlots));
  alert(`✅ Refund processed for ${team}`);
  updateAdminDashboard();
}

// ===== DARK MODE =====
function toggleDarkMode(){
  document.body.classList.toggle("dark");
}

// ===== INITIAL LOAD =====
window.addEventListener("load", ()=>{
  updateSlotText();
  updateFeeSlots();
  updateAdminDashboard();
});
