let totalSlots = 12;
let usedSlots = 0;
let selectedFee = "";

// ✅ Apps Script Web App URL updated
const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbzOaQ_nca2erCBpehIWwgUbvdGYBZQ9qc2PYfXEe2apYNbodbhrwil5RawSvUcUmurmAA/exec";

// Update available slots
function updateSlots() {
  const remaining = totalSlots - usedSlots;
  const slotText = document.getElementById("slots");
  const slotHeader = document.getElementById("slotText");

  slotText.innerText = remaining;

  if (remaining <= 0) {
    slotHeader.innerHTML = "❌ Slots Full";
    document.getElementById("details").classList.add("hidden");
  }
}
updateSlots();

// Select entry fee
function selectFee(fee) {
  selectedFee = fee;
  document.getElementById("details").classList.remove("hidden");
}

// Submit form
function goPayment() {
  const team = document.getElementById("team").value.trim();
  const wp = document.getElementById("wp").value.trim();

  if (!team || !wp || !selectedFee) {
    alert("Please fill all details!");
    return;
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
