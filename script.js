/**************** CONFIG ****************/
const BOT_TOKEN = "8590731449:AAG6gS62b_H1ARggfATZyWBiOEFfKLSobK8";
const CHAT_ID = "6165927254";

const MATCHES = ["12:00 PM", "3:00 PM", "9:00 PM"];
const FEES = [20, 25, 30];
const TOTAL_SLOTS = 12;

/**************** SLOT STORAGE ****************/
// Array structure to allow .includes()
let usedSlots = JSON.parse(localStorage.getItem("usedSlots")) || {
  "12:00 PM": { 20: [], 25: [], 30: [] },
  "3:00 PM": { 20: [], 25: [], 30: [] },
  "9:00 PM": { 20: [], 25: [], 30: [] }
};

let selectedMatch = null;
let selectedFee = null;

/**************** DARK MODE ****************/
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

/**************** MATCH SELECT ****************/
function selectMatch(match) {
  selectedMatch = match;
  selectedFee = null;
  
  document.getElementById("feeBox").classList.remove("hidden");
  document.getElementById("details").classList.add("hidden");
  
  updateSlotText();
  updateFeeSlots();
}

/**************** FEE SELECT ****************/
function selectFee(fee) {
  if (!selectedMatch) {
    alert("❌ Select match first");
    return;
  }
  
  const left = TOTAL_SLOTS - usedSlots[selectedMatch][fee].length;
  if (left <= 0) {
    alert(`❌ ₹${fee} lobby full`);
    return;
  }
  
  selectedFee = fee;
  document.getElementById("details").classList.remove("hidden");
  updateSlotText();
}

/**************** SLOT TEXT ****************/
function updateSlotText() {
  const el = document.getElementById("slotText");
  if (selectedMatch && selectedFee) {
    const left = TOTAL_SLOTS - usedSlots[selectedMatch][selectedFee].length;
    el.innerHTML = `Match: ${selectedMatch} | Fee: ₹${selectedFee} | Slots Left: <b>${left}</b>`;
  } else if (selectedMatch) {
    el.innerText = `Match selected: ${selectedMatch}`;
  } else {
    el.innerText = "Select match time to continue";
  }
}

/**************** FEE COUNTER ****************/
function updateFeeSlots() {
  FEES.forEach(fee => {
    const span = document.getElementById("slot" + fee);
    if (span && selectedMatch) {
      span.innerText = `${TOTAL_SLOTS - usedSlots[selectedMatch][fee].length} slots left`;
    }
  });
}

/**************** COPY UPI ****************/
function copyUPI() {
  navigator.clipboard.writeText(document.getElementById("upi").innerText);
  alert("✅ UPI copied");
}

/**************** IMAGE PREVIEW ****************/
document.getElementById("ss").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = () => {
    const img = document.getElementById("preview");
    img.src = reader.result;
    img.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

/**************** SUBMIT ****************/
function submitForm() {
  const team = document.getElementById("team").value.trim();
  const wp = document.getElementById("wp").value.trim();
  const ss = document.getElementById("ss").files[0];
  
  if (!team || !wp || !ss || !selectedMatch || !selectedFee) {
    alert("❌ Fill all details");
    return;
  }
  
  // Check duplicate team for same match (any fee)
  let allTeamsInMatch = [];
  FEES.forEach(fee => {
    allTeamsInMatch = allTeamsInMatch.concat(usedSlots[selectedMatch][fee]);
  });
  
  if (allTeamsInMatch.includes(team)) {
    alert("❌ Team already registered for this match (any fee)");
    return;
  }
  
  // Add team to selected fee
  usedSlots[selectedMatch][selectedFee].push(team);
  localStorage.setItem("usedSlots", JSON.stringify(usedSlots));
  
  // Send to Telegram
  sendTelegram(team, wp, ss);
  
  // Show success & update dashboard
  showSuccess();
  updateAdminDashboard();
}

/**************** TELEGRAM SEND ****************/
function sendTelegram(team, wp, ss) {
  const form = new FormData();
  form.append("chat_id", CHAT_ID);
  form.append("caption",
    `🔥 NEW SCRIM ENTRY\n\n🎮 Team: ${team}\n📱 WhatsApp: ${wp}\n🕒 Match: ${selectedMatch}\n💰 Fee: ₹${selectedFee}`
  );
  form.append("photo", ss);
  
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
    method: "POST",
    body: form
  }).catch(() => alert("❌ Telegram failed"));
}

/**************** SUCCESS ****************/
function showSuccess() {
  document.getElementById("details").classList.add("hidden");
  document.getElementById("success").classList.remove("hidden");
}

function goHome() {
  document.getElementById("success").classList.add("hidden");
  ["team", "wp", "ss"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("preview").classList.add("hidden");
  
  selectedMatch = null;
  selectedFee = null;
  updateSlotText();
}

/**************** ADMIN DASH ****************/
function updateAdminDashboard() {
  const dash = document.getElementById("adminDashboard");
  dash.innerHTML = "";
  
  MATCHES.forEach(match => {
    const box = document.createElement("div");
    box.className = "admin-box";
    box.innerHTML = `<b>${match}</b><br>
      ₹20: ${usedSlots[match][20].length} / ${TOTAL_SLOTS}<br>
      ₹25: ${usedSlots[match][25].length} / ${TOTAL_SLOTS}<br>
      ₹30: ${usedSlots[match][30].length} / ${TOTAL_SLOTS}`;
    dash.appendChild(box);
  });
}

// Initialize
updateAdminDashboard();
updateSlotText();
