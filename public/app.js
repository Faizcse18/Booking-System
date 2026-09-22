const API = "";

let currentUserId = null;
let currentUserEmail = "";
let selectedEventId = null;

window.onload = loadEvents;

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


// Load Events
async function loadEvents() {
    try {
        const response = await fetch(`${API}/events`);
        const events = await response.json();

        if (!response.ok) {
            throw new Error(events.message || "Unable to load events.");
        }

        const container = document.getElementById("events");
        container.innerHTML = "";

        events.forEach(event => {
            container.innerHTML += `
                <div class="card">
                    <h3>${event.title}</h3>
                    <p>Location : ${event.location}</p>
                    <p>Date : ${event.event_date}</p>
                    <p>Seats : ${event.seats}</p>

                    <button onclick="selectEvent(${event.id}, '${event.title}')">
                        Book Now
                    </button>
                </div>
            `;
        });
    } catch (error) {
        alert(error.message);
    }
}


// Select Event
function selectEvent(id, title) {
    selectedEventId = id;

    document.getElementById("selectedEvent").innerText =
        `Selected Event : ${title}`;
}


// Register User
async function registerUser() {
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    if (!name) {
        alert("Name is required.");
        nameInput.focus();
        return;
    }

    if (!email) {
        alert("Email is required.");
        emailInput.focus();
        return;
    }

    if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        emailInput.focus();
        return;
    }

    try {
        const response = await fetch(`${API}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Registration failed.");
            return;
        }

        currentUserId = data.id;
        currentUserEmail = email;

        document.getElementById("registeredUser").innerText =
            `Registered as ${name} (User ID : ${currentUserId})`;

        alert(data.message || "Registration successful.");
    } catch (error) {
        alert("Registration failed. Please try again.");
    }
}


// Book Event
async function bookEvent() {
    if (currentUserId === null) {
        alert("Please register first.");
        return;
    }

    if (selectedEventId === null) {
        alert("Select an event first.");
        return;
    }

    const quantityInput = document.getElementById("qty");
    const quantity = Number(quantityInput.value);

    if (!Number.isInteger(quantity) || quantity <= 0) {
        alert("Booking quantity must be a whole number greater than zero.");
        quantityInput.focus();
        return;
    }

    try {
        const response = await fetch(`${API}/book`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: currentUserId,
                event_id: selectedEventId,
                quantity
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Booking failed.");
            return;
        }

        alert(data.message || "Booking successful.");
        await loadEvents();
    } catch (error) {
        alert("Booking failed. Please try again.");
    }
}


// Booking History
async function loadBookings() {
    const searchEmail = document.getElementById("searchEmail").value.trim();
    const email = searchEmail || currentUserEmail;

    if (!email) {
        alert("Please enter an email address.");
        return;
    }

    if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    try {
        const response = await fetch(
            `${API}/bookings/${encodeURIComponent(email)}`
        );

        const bookings = await response.json();

        if (!response.ok) {
            alert(bookings.message || "Unable to load bookings.");
            return;
        }

        const container = document.getElementById("bookings");
        container.innerHTML = "";

        bookings.forEach(item => {
            container.innerHTML += `
                <div class="card">
                    <h3>${item.title}</h3>
                    <p>${item.location}</p>
                    <p>Date : ${item.event_date}</p>
                    <p>Tickets : ${item.quantity}</p>
                    <p>${item.booked_at}</p>
                </div>
            `;
        });
    } catch (error) {
        alert("Unable to load bookings. Please try again.");
    }
}
``
``