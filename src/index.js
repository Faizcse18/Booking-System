/**

* Event Booking System Worker
  */

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // Client IP used as the rate-limit key
        const clientIp =
            request.headers.get("CF-Connecting-IP") || "local";

        // =========================
        // GET /events
        // 60 requests per minute
        // =========================
        if (request.method === "GET" && url.pathname === "/events") {

            const { success } = await env.EVENTS_RATE_LIMIT.limit({
                key: clientIp
            });

            if (!success) {
                return Response.json({
                    message: "Too many requests. Please try again later."
                }, { status: 429 });
            }

            const result = await env.booking_db
                .prepare("SELECT * FROM events")
                .all();

            return Response.json(result.results);
        }

        // =========================
        // POST /users
        // 5 requests per minute
        // =========================
        if (request.method === "POST" && url.pathname === "/users") {

            const { success } = await env.USERS_RATE_LIMIT.limit({
                key: clientIp
            });

            if (!success) {
                return Response.json({
                    message: "Too many registration attempts. Please try again later."
                }, { status: 429 });
            }

            const body = await request.json();
            const { name, email } = body;

            const result = await env.booking_db
                .prepare(
                    "INSERT INTO users (name, email) VALUES (?, ?)"
                )
                .bind(name, email)
                .run();

            return Response.json({
                id: result.meta.last_row_id,
                message: "User created successfully",
            });
        }

        // =========================
        // POST /book
        // 10 requests per minute
        // =========================
        if (request.method === "POST" && url.pathname === "/book") {

            const { success } = await env.BOOK_RATE_LIMIT.limit({
                key: clientIp
            });

            if (!success) {
                return Response.json({
                    message: "Too many booking attempts. Please try again later."
                }, { status: 429 });
            }

            const body = await request.json();
            const { user_id, event_id, quantity } = body;

            // Find event
            const event = await env.booking_db
                .prepare("SELECT * FROM events WHERE id = ?")
                .bind(event_id)
                .first();

            if (!event) {
                return Response.json({ message: "Event not found" }, { status: 404 });
            }

            // Check seats
            if (event.seats < quantity) {
                return Response.json({ message: "Not enough seats available" }, { status: 400 });
            }

            // Insert booking
            await env.booking_db
                .prepare(
                    `
        INSERT INTO bookings(user_id, event_id, quantity)
        VALUES( ? , ? , ? )
        `
                )
                .bind(user_id, event_id, quantity)
                .run();

            // Update remaining seats
            await env.booking_db
                .prepare(
                    "UPDATE events SET seats = seats - ? WHERE id = ?"
                )
                .bind(quantity, event_id)
                .run();

            return Response.json({
                message: "Booking successful",
            });
        }

        // =========================
        // GET /bookings/:email
        // 20 requests per minute
        // =========================
        if (
            request.method === "GET" &&
            url.pathname.startsWith("/bookings/")
        ) {

            const { success } = await env.BOOKINGS_RATE_LIMIT.limit({
                key: clientIp
            });

            if (!success) {
                return Response.json({
                    message: "Too many requests. Please try again later."
                }, { status: 429 });
            }

            const email = decodeURIComponent(
                url.pathname.split("/")[2]
            );

            const result = await env.booking_db
                .prepare(
                    `
        SELECT
        events.title,
            events.location,
            events.event_date,
            bookings.quantity,
            bookings.booked_at
        FROM users
        JOIN bookings
        ON users.id = bookings.user_id
        JOIN events
        ON events.id = bookings.event_id
        WHERE users.email = ? `
                )
                .bind(email)
                .all();

            return Response.json(result.results);
        }

        // =========================
        // Default route
        // =========================
        return env.ASSETS.fetch(request);
    },

};