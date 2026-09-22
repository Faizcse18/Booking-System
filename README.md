# Event Booking System

A full-stack event booking system built with **Cloudflare Workers, D1, HTML, CSS, and JavaScript**.

## Features

* Browse available events
* User registration
* Book event tickets
* View booking history
* Seat availability management
* Input validation
* API rate limiting

## Tech Stack

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Cloudflare Workers
* **Database:** Cloudflare D1
* **Rate Limiting:** Cloudflare Workers Rate Limiting

## API

| Method | Endpoint           | Purpose       |
| ------ | ------------------ | ------------- |
| GET    | `/events`          | Get events    |
| POST   | `/users`           | Register user |
| POST   | `/book`            | Book tickets  |
| GET    | `/bookings/:email` | View bookings |

## Run Locally

```bash
npm install
npx wrangler dev
```

Open `http://localhost:8787`

## Author

**Muhammad Faiz**
