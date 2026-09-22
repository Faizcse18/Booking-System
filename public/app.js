const API = "";

let currentUserId = null;
let currentUserEmail = "";
let selectedEventId = null;

window.onload = loadEvents;


// Load Events
async function loadEvents() {

    const response = await fetch(`${API}/events`);
    const events = await response.json();

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

}


// Select Event
function selectEvent(id, title) {

    selectedEventId = id;

    document.getElementById("selectedEvent").innerText =
        `Selected Event : ${title}`;

}


// Register User
async function registerUser() {

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

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

    currentUserId = data.id;
    currentUserEmail = email;

    document.getElementById("registeredUser").innerText =
        `Registered as ${name} (User ID : ${currentUserId})`;

    alert(data.message);

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

    const quantity = Number(document.getElementById("qty").value);

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

    alert(data.message);

    loadEvents();

}


// Booking History
async function loadBookings() {

    const email =
        document.getElementById("searchEmail").value || currentUserEmail;

    const response =
        await fetch(`${API}/bookings/${email}`);

    const bookings = await response.json();

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

}