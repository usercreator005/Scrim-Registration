/**************** CONFIG ****************/
const SCRIPT_URL = "https://ffss-35j.pages.dev/api";

const MATCHES = ["12:00 PM", "3:00 PM", "9:00 PM"];
const FEES = [20, 25, 30];
const TOTAL_SLOTS = 12;

/**************** SLOT STORAGE ****************/
// Store booked teams in localStorage for frontend slot tracking
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
  const upiText = document.getElementById("upi")?.innerText || "";
  if (upiText) {
    navigator.clipboard.writeText(upiText);
    alert("✅ UPI copied");
  } else {
    alert("⚠️ No UPI found");
  }
}

/**************** IMAGE PREVIEW ****************/
document.getElementById("ss")?.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = () => {
    const img = document.getElementById("preview");
    if (img) {
      img.src = reader.result;
      img.classList.remove("hidden");
    }
  };
  reader.readAsDataURL(file);
});

/**************** FORM SUBMISSION ****************/
function submitForm() {
  const team = document.getElementById("team").value.trim();
  const wp = document.getElementById("wp").value.trim();
  const ssFile = document.getElementById("ss").files[0];
  
  if (!team || !wp || !ssFile || !selectedMatch || !selectedFee) {
    alert("❌ Fill all details");
    return;
  }
  
  // FRONTEND DUPLICATE CHECK
  let allTeamsInMatch = [];
  FEES.forEach(fee => {
    allTeamsInMatch = allTeamsInMatch.concat(usedSlots[selectedMatch][fee]);
  });
  
  if (allTeamsInMatch.includes(team)) {
    alert("❌ Team already registered for this match (any fee)");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = () => {
    const payload = {
      team,
      whatsapp: wp,
      match: selectedMatch,
      entryFee: selectedFee,
      screenshot: reader.result
    };
    
    fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      })
      .then(res => res.json())
      .then(res => {
        if (res.status === "ok") {
          alert("✅ Registration successful!");
          
          // UPDATE LOCAL SLOTS
          usedSlots[selectedMatch][selectedFee].push(team);
          localStorage.setItem("usedSlots", JSON.stringify(usedSlots));
          
          showSuccess();
          updateSlotText();
          updateFeeSlots();
          updateAdminDashboard();
        } else {
          alert("❌ " + res.message);
        }
      })
      .catch(err => alert("❌ Network error: " + err));
  };
  
  reader.readAsDataURL(ssFile);
}

/**************** SUCCESS ****************/
function showSuccess() {
  document.getElementById("details").classList.add("hidden");
  document.getElementById("success").classList.remove("hidden");
}

function goHome() {
  document.getElementById("success").classList.add("hidden");
  ["team", "wp", "ss"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const preview = document.getElementById("preview");
  if (preview) preview.classList.add("hidden");
  
  selectedMatch = null;
  selectedFee = null;
  updateSlotText();
}

/**************** ADMIN DASHBOARD ****************/
function updateAdminDashboard() {
  const dash = document.getElementById("adminDashboard");
  if (!dash) return;
  
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

/**************** INITIALIZE ****************/
updateAdminDashboard();
updateSlotText();
updateFeeSlots();
