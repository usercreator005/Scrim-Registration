// ===== TELEGRAM CONFIG =====
const BOT_TOKEN = "8534638634:AAGKqNvc4o3VtQRND445xZ-u_YxYAyHPAD4";
const CHAT_ID = "6165927254";

// ===== CONFIG =====
const MATCHES = ["12:00 PM","3:00 PM","9:00 PM"];
const FEES = [20,25,30];
const TOTAL_SLOTS = 12;

// usedSlots[match][fee] = current number of registrations
let usedSlots = JSON.parse(localStorage.getItem("usedSlots")) || {
  "12:00 PM": {20:0,25:0,30:0},
  "3:00 PM": {20:0,25:0,30:0},
  "9:00 PM": {20:0,25:0,30:0}
};

// registrations = store registration details for cancel/refund
let registrations = JSON.parse(localStorage.getItem("registrations")) || [];

let selectedMatch = null;
let selectedFee = null;

// ===== SELECT MATCH =====
function selectMatch(match){
  selectedMatch = match;
  selectedFee = null;

  document.getElementById("feeBox").classList.remove("hidden");
  document.getElementById("details").classList.add("hidden");

  document.getElementById("slotText").innerText =
    `Match selected: ${match}. Choose entry fee`;
  updateSlotDisplay();
}

// ===== SELECT FEE =====
function selectFee(fee){
  if(!selectedMatch){
    alert("❌ Please select match time first");
    return;
  }

  const left = TOTAL_SLOTS - usedSlots[selectedMatch][fee];
  if(left <= 0){
    alert("❌ Slots full");
    return;
  }

  selectedFee = fee;
  document.getElementById("slotText").innerHTML =
    `Slots left for ${selectedMatch} | ₹${fee}: <b>${left}</b>`;

  document.getElementById("details").classList.remove("hidden");
}

// ===== COPY UPI =====
function copyUPI(){
  navigator.clipboard.writeText(document.getElementById("upi").innerText);
  alert("UPI ID copied");
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

  if(!team || !wp || !ss){
    alert("❌ Fill all details");
    return;
  }

  if(usedSlots[selectedMatch][selectedFee] >= TOTAL_SLOTS){
    alert("❌ Slots full");
    return;
  }

  sendToTelegram(team, wp, ss);
}

// ===== TELEGRAM SEND =====
function sendToTelegram(team, wp, ss){
  const form = new FormData();
  form.append("chat_id", CHAT_ID);
  form.append("caption",
`🔥 NEW SCRIM REGISTRATION
🎮 Team: ${team}
📱 WhatsApp: ${wp}
🕒 Match: ${selectedMatch}
💰 Entry Fee: ₹${selectedFee}
⏳ Payment verification pending`);
  form.append("photo", ss);

  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
    method:"POST",
    body:form
  }).then(()=>{
    // update slots
    usedSlots[selectedMatch][selectedFee]++;
    localStorage.setItem("usedSlots", JSON.stringify(usedSlots));

    // save registration for cancel/refund
    registrations.push({
      team, wp, match: selectedMatch, fee: selectedFee, timestamp: Date.now()
    });
    localStorage.setItem("registrations", JSON.stringify(registrations));

    // show success
    document.getElementById("details").classList.add("hidden");
    document.getElementById("success").classList.remove("hidden");

    updateSlotDisplay();
  }).catch(()=>{
    alert("❌ Network error");
  });
}

// ===== CANCEL / REFUND =====
function cancelRegistration(teamName, matchTime){
  const now = new Date();
  const matchDateTime = getMatchDateTime(matchTime);

  // check if 1 hour before match
  if(matchDateTime - now < 60*60*1000){
    alert("❌ Cancellation window closed (1 hour before match)");
    return;
  }

  const index = registrations.findIndex(r=>r.team===teamName && r.match===matchTime);
  if(index === -1){
    alert("❌ Registration not found");
    return;
  }

  // remove registration
  const reg = registrations.splice(index,1)[0];
  usedSlots[reg.match][reg.fee]--;
  localStorage.setItem("registrations", JSON.stringify(registrations));
  localStorage.setItem("usedSlots", JSON.stringify(usedSlots));

  alert(`✅ Registration for ${teamName} cancelled. Refund will be processed automatically.`);

  updateSlotDisplay();
  renderAdminDashboard();
}

// ===== HELPER: GET MATCH DATETIME =====
function getMatchDateTime(match){
  const today = new Date();
  let [hour, minPart] = match.split(":");
  let minutes = parseInt(minPart);
  let period = match.slice(-2); // AM or PM
  let hour24 = parseInt(hour);
  if(period==="PM" && hour24<12) hour24+=12;
  if(period==="AM" && hour24===12) hour24=0;
  today.setHours(hour24, minutes, 0,0);
  return today;
}

// ===== RESET FORM =====
function goHome(){
  document.getElementById("success").classList.add("hidden");
  document.getElementById("team").value="";
  document.getElementById("wp").value="";
  document.getElementById("ss").value="";
  document.getElementById("preview").classList.add("hidden");

  selectedMatch=null;
  selectedFee=null;

  document.getElementById("slotText").innerText="Select match time to continue";
  window.scrollTo({top:0, behavior:"smooth"});
}

// ===== UPDATE SLOT DISPLAY =====
function updateSlotDisplay(){
  FEES.forEach(fee=>{
    document.getElementById("slot"+fee).innerText = 
      TOTAL_SLOTS - (selectedMatch ? usedSlots[selectedMatch][fee] : 0);
  });
}

// ===== ADMIN DASHBOARD =====
function renderAdminDashboard(){
  const dash = document.getElementById("adminDashboard");
  dash.innerHTML = "";

  registrations.forEach(r=>{
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
      <b>${r.team}</b> | ${r.match} | ₹${r.fee} 
      <button onclick="cancelRegistration('${r.team}','${r.match}')">Cancel / Refund</button>
    `;
    dash.appendChild(div);
  });
}

// initial render
updateSlotDisplay();
renderAdminDashboard();
