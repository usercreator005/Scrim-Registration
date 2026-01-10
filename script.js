let totalSlots = 12;
let usedSlots = 0;
let selectedFee = "";

const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbziGZXjprT4TpyyTjUk8vDKeoq2VcEd9cwirx3H_QXgKy_wbvMAkXg3AprNv6Gky_LLIw/exec";

function updateSlots() {
  document.getElementById("slots").innerText = totalSlots - usedSlots;
  if (totalSlots - usedSlots <= 0) {
    document.getElementById("slotText").innerHTML = "❌ Slots Full";
  }
}
updateSlots();

function selectFee(fee) {
  selectedFee = fee;
  document.getElementById("details").classList.remove("hidden");
}

function goPayment() {
  let team = document.getElementById("team").value.trim();
  let wp = document.getElementById("wp").value.trim();

  if (!team || !wp || !selectedFee) {
    alert("Fill all details");
    return;
  }

  submitForm(team, wp);
}

function submitForm(team, wp) {
  let btn = document.querySelector("#details button");
  btn.disabled = true;
  btn.innerText = "Submitting...";

  let formData = new FormData();
  formData.append("team", team);
  formData.append("whatsapp", wp);
  formData.append("fee", selectedFee);

  fetch(WEB_APP_URL, {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        usedSlots++;
        updateSlots();
        document.getElementById("success").classList.remove("hidden");
        document.getElementById("details").classList.add("hidden");
      } else {
        alert("Server error");
      }
      btn.disabled = false;
      btn.innerText = "Submit";
    })
    .catch(err => {
      alert("Network Error");
      btn.disabled = false;
      btn.innerText = "Submit";
    });
}
