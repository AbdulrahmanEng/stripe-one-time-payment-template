// The max and min number of photos a customer can purchase
var MIN_PHOTOS = 1;
var MAX_PHOTOS = 10;

var basicPhotoButton = document.getElementById("basic-photo-button");
document
  .getElementById("quantity-input")
  .addEventListener("change", function(evt) {
    // Ensure customers only buy between 1 and 10 photos
    if (evt.target.value < MIN_PHOTOS) {
      evt.target.value = MIN_PHOTOS;
    }
    if (evt.target.value > MAX_PHOTOS) {
      evt.target.value = MAX_PHOTOS;
    }
  });

/* Method for changing the product quantity when a customer clicks the increment / decrement buttons */
var updateQuantity = function(evt) {
  if (evt && evt.type === "keypress" && evt.keyCode !== 13) {
    return;
  }

  var isAdding = evt.target.id === "add";
  var inputEl = document.getElementById("quantity-input");
  var currentQuantity = parseInt(inputEl.value);

  document.getElementById("add").disabled = false;
  document.getElementById("subtract").disabled = false;

  // Calculate new quantity
  var quantity = isAdding ? currentQuantity + 1 : currentQuantity - 1;

  inputEl.value = quantity;
  document.getElementById("total").textContent = quantity * 5;

  // Disable the button if the customers hits the max or min
  if (quantity === MIN_PHOTOS) {
    document.getElementById("subtract").disabled = true;
  }
  if (quantity === MAX_PHOTOS) {
    document.getElementById("add").disabled = true;
  }
};

/* Attach method */
Array.from(document.getElementsByClassName("increment-btn")).forEach(
  element => {
    element.addEventListener("click", updateQuantity);
  }
);

/* Handle any errors returns from Checkout  */
var handleResult = function(result) {
  if (result.error) {
    var displayError = document.getElementById("error-message");
    displayError.textContent = result.error.message;
  }
};

// Create a Checkout Session with the selected quantity
var createCheckoutSession = function(stripe) {
  var inputEl = document.getElementById("quantity-input");
  var quantity = parseInt(inputEl.value);

  return fetch("/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      quantity: quantity
    })
  }).then(function(result) {
    return result.json();
  });
};

// Handle any errors returned from Checkout
var handleResult = function(result) {
  if (result.error) {
    var displayError = document.getElementById("error-message");
    displayError.textContent = result.error.message;
  }
};

/* Get your Stripe public key to initialize Stripe.js */
fetch("/public-key")
  .then(function(result) {
    return result.json();
  })
  .then(function(json) {
    var publicKey = json.publicKey;
    var stripe = Stripe(publicKey);
    // Setup event handler to create a Checkout Session on submit
    document.querySelector("#submit").addEventListener("click", function(evt) {
      createCheckoutSession().then(function(data) {
        stripe
          .redirectToCheckout({
            sessionId: data.sessionId
          })
          .then(handleResult);
      });
    });
  });
