let totalSlots = 12;
let usedSlots = 0;
let selectedFee = "";

function updateSlots() {
  document.getElementById("slots").innerText = totalSlots - usedSlots;
  if (totalSlots - usedSlots <= 0) {
    document.getElementById("slotText").innerHTML = "❌ Slots Full";
  }
}
updateSlots();

function selectFee(fee) {
  if (totalSlots - usedSlots <= 0) {
    alert("Slots Full");
    return;
  }
  selectedFee = fee;
  document.getElementById("details").classList.remove("hidden");
  scrollDown();
}

function goPayment() {
  let team = document.getElementById("team").value.trim();
  let wp = document.getElementById("wp").value.trim();
  if (!team || !wp) { alert("Fill all details"); return; }
  
  submitForm(team, wp);
}

function submitForm(team, wp) {
  let btn = document.querySelector("#details button");
  btn.disabled = true;
  btn.innerText = "Submitting...";
  
  let payload = {
    team: team,
    whatsapp: wp,
    fee: selectedFee,
    screenshot: "Not Uploaded" // Screenshot temporarily skipped
  };
  
  fetch("https://script.google.com/macros/s/AKfycbwBdWP8cHolkNLtdLIIkPvEPzOfq_wYET7xi70RwbQMlrM-b2tw9VS5IQ8t1KdHv3iKCA/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        usedSlots++;
        updateSlots();
        document.getElementById("success").classList.remove("hidden");
        document.getElementById("details").classList.add("hidden");
        btn.disabled = false;
        btn.innerText = "Submit";
        scrollDown();
      } else {
        alert("Error: " + (data.message || "Try again"));
        btn.disabled = false;
        btn.innerText = "Submit";
      }
    })
  .catch(err => {
  alert("ERROR: " + err.message);
      btn.disabled = false;
      btn.innerText = "Submit";
    });
}

function scrollDown() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}
