const API = "/api";
const USER_STORAGE_KEY = "bookingUser";
const EVENT_STORAGE_KEY = "selectedEvent";

function isValidEmail(email) {
    const atPosition = email.indexOf("@");
    const dotPosition = email.lastIndexOf(".");

    return atPosition > 0 &&
        dotPosition > atPosition + 1 &&
        dotPosition < email.length - 1;
}

function getStoredUser() {
    try {
        return JSON.parse(sessionStorage.getItem(USER_STORAGE_KEY)) || null;
    } catch (error) {
        return null;
    }
}

function createTextElement(tag, text) {
    const element = document.createElement(tag);
    element.textContent = text || "";
    return element;
}


// Load events on events.html
async function loadEvents() {
    const container = document.getElementById("events");
    if (!container) return;

    container.textContent = "Loading events...";

    try {
        const response = await fetch(API + "/events");
        const events = await response.json();

        if (!response.ok) {
            throw new Error(events.message || "Unable to load events.");
        }

        container.innerHTML = "";

        if (!Array.isArray(events) || events.length === 0) {
            container.textContent = "No events are currently available.";
            return;
        }

        events.forEach(function(event) {
            const card = document.createElement("article");
            card.className = "card";

            card.appendChild(createTextElement("h2", event.title));
            card.appendChild(createTextElement("p", "Location: " + event.location));
            card.appendChild(createTextElement("p", "Date: " + event.event_date));
            card.appendChild(createTextElement("p", "Seats: " + event.seats));

            const button = document.createElement("button");
            button.type = "button";
            button.textContent = "Book Now";
            button.addEventListener("click", function() {
                selectEvent(event);
            });

            card.appendChild(button);
            container.appendChild(card);
        });
    } catch (error) {
        container.textContent = error.message || "Unable to load events.";
    }
}


// Save the selected event and open booking.html
function selectEvent(event) {
    sessionStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify({
        id: event.id,
        title: event.title
    }));

    window.location.href = "booking.html";
}


// Register on register.html
async function registerUser() {
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");

    if (!nameInput || !emailInput) return;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    if (!name) {
        alert("Name is required.");
        nameInput.focus();
        return;
    }

    if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        emailInput.focus();
        return;
    }

    try {
        const response = await fetch(API + "/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Registration failed.");
            return;
        }

        if (!data.id) {
            alert("Registration succeeded, but the server did not return a user ID.");
            return;
        }

        sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
            id: data.id,
            name: name,
            email: email
        }));

        const status = document.getElementById("registeredUser");
        if (status) {
            status.textContent = "Registered as " + name + ".";
        }

        alert(data.message || "Registration successful.");

        if (sessionStorage.getItem(EVENT_STORAGE_KEY)) {
            window.location.href = "booking.html";
        }
    } catch (error) {
        alert("Registration failed. Please try again.");
    }
}


// Show the selected event on booking.html
function showSelectedEvent() {
    const display = document.getElementById("selectedEvent");
    if (!display) return;

    try {
        const event = JSON.parse(sessionStorage.getItem(EVENT_STORAGE_KEY));

        if (event) {
            display.textContent = "Selected event: " + event.title;
        } else {
            display.textContent = "Select an event from the events page first.";
        }
    } catch (error) {
        display.textContent = "Select an event from the events page first.";
    }
}


// Book tickets on booking.html
async function bookEvent() {
    const user = getStoredUser();
    const quantityInput = document.getElementById("qty");
    let event = null;

    try {
        event = JSON.parse(sessionStorage.getItem(EVENT_STORAGE_KEY));
    } catch (error) {
        event = null;
    }

    if (!user || !user.id) {
        alert("Please register before booking.");
        window.location.href = "register.html";
        return;
    }

    if (!event || !event.id) {
        alert("Please select an event first.");
        window.location.href = "events.html";
        return;
    }

    if (!quantityInput) return;

    const quantity = Number(quantityInput.value);

    if (!Number.isInteger(quantity) || quantity <= 0) {
        alert("Booking quantity must be a whole number greater than zero.");
        quantityInput.focus();
        return;
    }

    try {
        const response = await fetch(API + "/book", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: Number(user.id),
                event_id: Number(event.id),
                quantity: quantity
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Booking failed.");
            return;
        }

        alert(data.message || "Booking successful.");
    } catch (error) {
        alert("Booking failed. Please try again.");
    }
}


// Load booking history on bookings.html
async function loadBookings() {
    const container = document.getElementById("bookings");
    const emailInput = document.getElementById("searchEmail");

    if (!container || !emailInput) return;

    const user = getStoredUser();
    let email = emailInput.value.trim();

    if (!email && user) {
        email = user.email;
    }

    if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        emailInput.focus();
        return;
    }

    container.textContent = "Loading bookings...";

    try {
        const response = await fetch(
            API + "/bookings/" + encodeURIComponent(email)
        );
        const bookings = await response.json();

        if (!response.ok) {
            throw new Error(bookings.message || "Unable to load bookings.");
        }

        container.innerHTML = "";

        if (!Array.isArray(bookings) || bookings.length === 0) {
            container.textContent = "No bookings found for this email.";
            return;
        }

        bookings.forEach(function(booking) {
            const card = document.createElement("article");
            card.className = "card";

            card.appendChild(createTextElement("h2", booking.title));
            card.appendChild(createTextElement("p", "Location: " + booking.location));
            card.appendChild(createTextElement("p", "Date: " + booking.event_date));
            card.appendChild(createTextElement("p", "Tickets: " + booking.quantity));
            card.appendChild(createTextElement("p", "Booked: " + booking.booked_at));

            container.appendChild(card);
        });
    } catch (error) {
        container.textContent = error.message || "Unable to load bookings.";
    }
}


// Initialize the features used on the current page
document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("events")) {
        loadEvents();
    }

    if (document.getElementById("selectedEvent")) {
        showSelectedEvent();
    }

    const emailInput = document.getElementById("searchEmail");
    const user = getStoredUser();

    if (emailInput && user && user.email) {
        emailInput.value = user.email;
    }
});

window.registerUser = registerUser;
window.bookEvent = bookEvent;
window.loadBookings = loadBookings;