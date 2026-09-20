const ROOMS = {
  deluxe: {
    name: "Deluxe Room",
    price: 4500,
    description:
      "Garden serenity with island elegance. Wake up to lush tropical greenery and the gentle sounds of nature in this serene hideaway.",
    amenities: ["King Bed", "Garden View", "Aircon", "Mini Bar"],
    maxGuests: 2,
    image:
      "https://images.unsplash.com/photo-1774280954999-9758f11f3d41?w=600&h=380&fit=crop&auto=format",
  },
  premier: {
    name: "Premier Suite",
    price: 8500,
    description:
      "Coastal luxury with panoramic views of the sea. An elevated experience designed for those who seek the finest.",
    amenities: ["King Bed", "Ocean View", "Jacuzzi", "Balcony"],
    maxGuests: 3,
    image:
      "https://images.unsplash.com/photo-1731336478850-6bce7235e320?w=600&h=380&fit=crop&auto=format",
  },
  cottage: {
    name: "Garden Cottage",
    price: 6000,
    description:
      "Seclusion, intimacy, and connection with nature. A private retreat nestled in lush tropical gardens.",
    amenities: ["Double Bed", "WiFi", "Garden", "Terrace"],
    maxGuests: 4,
    image:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&h=380&fit=crop&auto=format",
  },
};

const PAYMENT_OPTIONS = [
  {
    id: "credit",
    label: "Credit Card",
    detail: "Visa • Mastercard • JCB",
    symbol: "▣",
  },
  {
    id: "debit",
    label: "Debit Card",
    detail: "Visa Debit • Mastercard Debit • JCB",
    symbol: "▣",
  },
  { id: "gcash", label: "GCash", detail: "Send via GCash number", symbol: "▯" },
  { id: "maya", label: "Maya", detail: "Send via Maya number", symbol: "▯" },
  {
    id: "cash",
    label: "Cash on Arrival",
    detail: "Pay at front desk",
    symbol: "◉",
  },
];

const STEPS = [
  "Guest Details",
  "Accommodation",
  "Stay & Dates",
  "Payment",
  "Confirm",
];
const booking = {
  step: 1,
  room: "deluxe",
  guest: { firstName: "", lastName: "", email: "", age: "", pax: 1 },
  checkIn: "",
  checkOut: "",
  payment: "gcash",
  phone: "",
};

const dialog = document.querySelector("#booking-dialog");
const stepper = document.querySelector("#stepper");
const content = document.querySelector("#booking-content");
const actionsContainer = document.querySelector("#booking-actions");
const backButton = document.querySelector("#booking-back");
const nextButton = document.querySelector("#booking-next");
const stepCount = document.querySelector("#booking-step-count");
const landingElements = [
  document.querySelector(".site-header"),
  document.querySelector("main"),
  document.querySelector("footer"),
];

function template(id) {
  return document.querySelector(`#${id}`).content.cloneNode(true);
}

function setText(root, selector, value) {
  const element = root.querySelector(selector);
  if (element) element.textContent = value;
}

function setLandingLocked(locked) {
  document.body.classList.toggle("booking-open", locked);

  landingElements.forEach((element) => {
    if (element) element.inert = locked;
  });
}

function peso(value) {
  return `₱${value.toLocaleString("en-US")}`;
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatInputDate(value) {
  if (!value) return "dd/mm/yyyy";

  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function minimumDate() {
  return new Date().toISOString().split("T")[0];
}

function nextDate(value) {
  if (!value) return minimumDate();

  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().split("T")[0];
}

function nights() {
  if (!booking.checkIn || !booking.checkOut) return 0;

  const difference =
    new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime();

  return Math.max(0, Math.round(difference / 86400000));
}

function total() {
  return nights() * ROOMS[booking.room].price;
}

function fee() {
  return Math.round(total() * 0.3);
}

function renderStepper() {
  stepper.replaceChildren();

  STEPS.forEach((label, index) => {
    const step = document.createElement("div");
    const number = index + 1;
    const complete = booking.step > number;
    const active = booking.step === number;

    step.className = `step ${complete ? "complete" : ""} ${active ? "active" : ""}`;

    const numberElement = document.createElement("span");
    numberElement.className = "step-number";
    numberElement.textContent = complete ? "✓" : number;

    const labelElement = document.createElement("span");
    labelElement.className = "step-label";
    labelElement.textContent = label;

    step.append(numberElement, labelElement);
    stepper.append(step);
  });
}

function render() {
  renderStepper();
  content.replaceChildren();

  const views = [
    renderGuestDetails,
    renderAccommodation,
    renderStayDates,
    renderPayment,
    renderReview,
  ];

  content.append(views[booking.step - 1]());
  renderActions();
  bindInputs();
}

function renderGuestDetails() {
  const view = template("guest-template");
  const fields = view.querySelectorAll("[data-field]");
  const values = {
    firstName: booking.guest.firstName,
    lastName: booking.guest.lastName,
    email: booking.guest.email,
    age: booking.guest.age,
    pax: booking.guest.pax,
  };

  fields.forEach((field) => {
    field.value = values[field.dataset.field];
  });

  return view;
}

function createRoomCard(id, room) {
  const card = template("room-card-template").querySelector("article");
  const selected = booking.room === id;

  card.dataset.room = id;
  card.classList.toggle("selected", selected);
  card.querySelector("[data-room-image]").src = room.image;
  card.querySelector("[data-room-image]").alt = room.name;
  card.querySelector("[data-room-name]").textContent = room.name;
  card.querySelector("[data-room-description]").textContent =
    `${room.description.split(".")[0]}.`;
  card.querySelector("[data-room-price]").textContent = peso(room.price);
  card.querySelector("[data-room-capacity]").textContent =
    `Max ${room.maxGuests} Guest${room.maxGuests > 1 ? "s" : ""}`;
  card.querySelector(".room-check").hidden = !selected;

  const amenities = card.querySelector("[data-room-amenities]");
  room.amenities.forEach((amenity) => {
    const chip = document.createElement("span");
    chip.textContent = amenity;
    amenities.append(chip);
  });

  return card;
}

function renderAccommodation() {
  const view = template("accommodation-template");
  const grid = view.querySelector(".accommodation-grid");

  Object.entries(ROOMS).forEach(([id, room]) => {
    grid.append(createRoomCard(id, room));
  });

  return view;
}

function renderStayDates() {
  const view = template("dates-template");
  const room = ROOMS[booking.room];
  const checkIn = view.querySelector('[data-field="checkIn"]');
  const checkOut = view.querySelector('[data-field="checkOut"]');

  checkIn.value = booking.checkIn;
  checkIn.min = minimumDate();
  checkOut.value = booking.checkOut;
  checkOut.min = nextDate(booking.checkIn);

  setText(
    view,
    '[data-date-label="checkIn"]',
    formatInputDate(booking.checkIn),
  );
  setText(
    view,
    '[data-date-label="checkOut"]',
    formatInputDate(booking.checkOut),
  );
  setText(view, "[data-summary-room]", room.name);
  setText(view, "[data-summary-rate]", peso(room.price));
  setText(view, "[data-summary-rate-row]", peso(room.price));
  setText(
    view,
    "[data-summary-description]",
    `${room.description.split(".")[0]}.`,
  );
  setText(view, "[data-summary-capacity]", `Max ${room.maxGuests} Guests`);
  setText(view, "[data-summary-nights]", nights() || "—");
  setText(view, "[data-summary-total]", total() ? peso(total()) : "—");

  const amenities = view.querySelector("[data-summary-amenities]");
  room.amenities.forEach((amenity) => {
    const chip = document.createElement("span");
    chip.textContent = amenity;
    amenities.append(chip);
  });

  return view;
}

function createPaymentOption(option) {
  const view = template("payment-option-template");
  const button = view.querySelector("button");
  const selected = booking.payment === option.id;

  button.dataset.payment = option.id;
  button.classList.toggle("selected", selected);
  setText(view, "[data-payment-label]", option.label);
  setText(view, "[data-payment-detail]", option.detail);
  setText(view, ".payment-symbol", option.symbol);
  view.querySelector(".payment-check").hidden = !selected;

  return view;
}

function renderPayment() {
  const options = view.querySelector(".payment-options");
  const phone = view.querySelector('[data-field="phone"]');
  const requiresPhone =
    booking.payment === "gcash" || booking.payment === "maya";

  PAYMENT_OPTIONS.forEach((option) =>
    options.append(createPaymentOption(option)),
  );
  phone.value = booking.phone;
  phone.parentElement.hidden = !requiresPhone;
  phone.required = requiresPhone;

  setText(view, "[data-payment-room]", ROOMS[booking.room].name);
  setText(view, "[data-payment-total]", total() ? peso(total()) : "—");
  setText(view, "[data-payment-fee]", fee() ? peso(fee()) : "—");
  setText(
    view,
    "[data-payment-balance]",
    total() - fee() > 0 ? peso(total() - fee()) : "—",
  );

  return view;
}

function renderReview() {
  const view = template("review-template");
  const paymentLabel = PAYMENT_OPTIONS.find(
    (option) => option.id === booking.payment,
  ).label;

  setText(
    view,
    "[data-review-name]",
    `${booking.guest.firstName} ${booking.guest.lastName}`.trim() || "—",
  );
  setText(view, "[data-review-email]", booking.guest.email || "—");
  setText(view, "[data-review-age]", booking.guest.age || "—");
  setText(view, "[data-review-guests]", `${booking.guest.pax} pax`);
  setText(view, "[data-review-room]", ROOMS[booking.room].name);
  setText(view, "[data-review-check-in]", formatDate(booking.checkIn));
  setText(view, "[data-review-check-out]", formatDate(booking.checkOut));
  setText(
    view,
    "[data-review-duration]",
    nights() ? `${nights()} Night${nights() > 1 ? "s" : ""}` : "—",
  );
  setText(view, "[data-review-rate]", peso(ROOMS[booking.room].price));
  setText(view, "[data-review-payment]", paymentLabel);
  setText(view, "[data-review-fee]", fee() ? peso(fee()) : "—");
  setText(
    view,
    "[data-review-balance]",
    total() - fee() > 0 ? peso(total() - fee()) : "—",
  );
  setText(view, "[data-review-total]", total() ? peso(total()) : "—");

  return view;
}

function renderActions() {
  actionsContainer.hidden = false;
  backButton.disabled = booking.step === 1;
  stepCount.textContent = `Step ${booking.step} of 5`;
  nextButton.textContent = booking.step === 5 ? "Confirm ›" : "Continue ›";
}

backButton.addEventListener("click", () => {
  if (booking.step === 1) return;

  booking.step -= 1;
  render();
});

nextButton.addEventListener("click", () => {
  if (!validateStep()) return;

  if (booking.step === 5) {
    renderSuccess();
    return;
  }

  booking.step += 1;
  render();
});

function bindInputs() {
  content.querySelectorAll("[data-field]").forEach((input) => {
    input.addEventListener("input", (event) => {
      const field = event.target.dataset.field;

      if (["firstName", "lastName", "email", "age"].includes(field)) {
        booking.guest[field] = event.target.value;
      } else if (field === "pax") {
        booking.guest.pax = event.target.value;
      } else {
        booking[field] = event.target.value;
      }

      if (
        field === "checkIn" &&
        booking.checkOut &&
        booking.checkOut <= booking.checkIn
      ) {
        booking.checkOut = "";
      }

      if (field === "checkIn" || field === "checkOut") render();
    });
  });

  content.querySelectorAll("[data-room]").forEach((card) => {
    const chooseRoom = () => {
      booking.room = card.dataset.room;
      render();
    };

    card.addEventListener("click", chooseRoom);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        chooseRoom();
      }
    });
  });

  content.querySelectorAll("[data-payment]").forEach((option) => {
    option.addEventListener("click", () => {
      booking.payment = option.dataset.payment;
      render();
    });
  });
}

function validateStep() {
  const requiredFields = [...content.querySelectorAll("[required]")];

  for (const field of requiredFields) {
    if (!field.value.trim()) {
      field.reportValidity();
      return false;
    }

    if (field.dataset.field === "age" && Number(field.value) < 18) {
      field.setCustomValidity("The primary guest must be 18 or older.");
      field.reportValidity();
      field.setCustomValidity("");
      return false;
    }
  }

  if (booking.step === 3 && nights() < 1) {
    alert("Check-out must be after check-in date.");
    return false;
  }

  return true;
}

function renderSuccess() {
  const view = template("success-template");

  stepper.replaceChildren();
  actionsContainer.hidden = true;
  setText(view, "[data-success-email]", booking.guest.email || "your email");
  setText(view, "[data-success-room]", ROOMS[booking.room].name);
  setText(view, "[data-success-check-in]", formatDate(booking.checkIn));
  setText(view, "[data-success-check-out]", formatDate(booking.checkOut));
  setText(view, "[data-success-guests]", `${booking.guest.pax} pax`);
  setText(view, "[data-success-total]", peso(total()));
  content.replaceChildren(view);

  document
    .querySelector("#close-success")
    .addEventListener("click", () => dialog.close());
}

document.querySelectorAll(".book-trigger").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.room) booking.room = button.dataset.room;
    booking.step = 1;
    setLandingLocked(true);
    dialog.showModal();
    render();
  });
});

document
  .querySelector(".dialog-close")
  .addEventListener("click", () => dialog.close());

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

dialog.addEventListener("close", () => {
  setLandingLocked(false);
});

document.querySelector("#contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  event.target.reset();
  event.target.querySelector(".form-success").hidden = false;
});

window.addEventListener("scroll", () => {
  document
    .querySelector(".site-header")
    .classList.toggle("scrolled", window.scrollY > 50);
});
