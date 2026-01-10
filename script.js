// ===== CONFIG =====
let totalSlots = 12;
let usedSlots = 0;
let selectedFee = "";

const TELEGRAM_BOT_TOKEN = "8534638634:AAGKqNvc4o3VtQRND445xZ-u_YxYAyHPAD4";
const TELEGRAM_CHAT_ID = "6165927254";

// ===== SLOT UPDATE =====
function updateSlots() {
  const left = totalSlots - usedSlots;
  document.getElementById("slots").innerText = left;
  if (left <= 0) document.getElementById("slotText").innerHTML = "❌ Slots Full";
}
updateSlots();

// ===== PRICE SELECT =====
function selectFee(fee) {
  selectedFee = fee;
  document.getElementById("details").classList.remove("hidden");
}

// ===== SHOW PAYMENT =====
function showPayment() {
  const team = document.getElementById("team").value.trim();
  const wp = document.getElementById("wp").value.trim();
  if (!team || !wp) { alert("❌ Fill all details"); return; }
  document.getElementById("payAmount").innerText = "₹" + selectedFee;
  document.getElementById("upiId").innerText = "yourupi@bank";
  document.getElementById("qrImage").src = "qr.png";
  document.getElementById("paymentBox").classList.remove("hidden");
}

// ===== COPY UPI =====
function copyUPI() {
  navigator.clipboard.writeText("yourupi@bank");
  alert("✅ UPI ID Copied");
}

// ===== SCREENSHOT PREVIEW =====
document.getElementById("screenshot").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function () {
    let container = document.getElementById("ssPreviewContainer");
    container.innerHTML = "";
    let img = document.createElement("img");
    img.src = reader.result;
    img.style.width = "200px";
    img.style.marginTop = "10px";
    container.appendChild(img);
  };
  reader.readAsDataURL(file);
});

// ===== FINAL SUBMIT TO TELEGRAM =====
function finalSubmit() {
  const team = document.getElementById("team").value.trim();
  const wp = document.getElementById("wp").value.trim();
  const file = document.getElementById("screenshot").files[0];
  if (!file) { alert("❌ Upload screenshot"); return; }

  const reader = new FileReader();
  reader.onload = function () {
    const formData = new FormData();
    formData.append("chat_id", TELEGRAM_CHAT_ID);
    formData.append("photo", file);
    formData.append(
      "caption",
      `🎮 New Scrim Registration\n\nTeam: ${team}\nWhatsApp: ${wp}\nEntry Fee: ₹${selectedFee}`
    );

    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: "POST",
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      if(data.ok){
        usedSlots++;
        updateSlots();
        alert("✅ Registration sent to Admin");
        goHome();
      } else {
        alert("❌ Telegram send failed");
      }
    })
    .catch(err => { console.error(err); alert("❌ Network Error"); });
  };
  reader.readAsDataURL(file);
}

// ===== RESET & GO HOME =====
function resetAll() {
  selectedFee = "";
  document.getElementById("team").value = "";
  document.getElementById("wp").value = "";
  document.getElementById("screenshot").value = "";
  document.getElementById("details").classList.add("hidden");
  document.getElementById("paymentBox").classList.add("hidden");
  document.getElementById("ssPreviewContainer").innerHTML = "";
}

// ===== GO TO HOME BUTTON =====
function goHome() {
  resetAll();
  window.scrollTo({ top: 0, behavior: "smooth" });
    }    return;
  }

  submitForm(team, wp);
}

// Send data to Apps Script
function submitForm(team, wp) {
  const btn = document.querySelector("#details button");
  btn.disabled = true;
  btn.innerText = "Submitting...";

  const payload = {
    team: team,
    whatsapp: wp,
    entryFee: selectedFee
  };

  fetch(WEB_APP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        usedSlots++;
        updateSlots();
        document.getElementById("success").classList.remove("hidden");
        document.getElementById("details").classList.add("hidden");

        // Clear inputs
        document.getElementById("team").value = "";
        document.getElementById("wp").value = "";
        selectedFee = "";
      } else {
        alert("Server error. Try again later.");
      }

      btn.disabled = false;
      btn.innerText = "Submit";
    })
    .catch(err => {
      alert("Network Error. Check your connection!");
      btn.disabled = false;
      btn.innerText = "Submit";
      console.error(err);
    });
}
