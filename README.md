# PayFlow Gateway

PayFlow Gateway is a simplified **end-to-end payment gateway system** inspired by real platforms like Razorpay and Stripe.  
It demonstrates how payments are created, processed asynchronously, delivered via webhooks, and managed with refunds — all using production-grade backend patterns.

This project focuses on **system design, reliability, and real-world architecture**, not just CRUD APIs.

---

## Evaluation Note

**Deliverable 2 (Async Jobs, Webhooks, Refunds, Idempotency, SDK)**  
is implemented on the branch:

--> **`deliverable-2`**

Please evaluate the **deliverable-2** branch.

---

## What This Project Covers

### Core Capabilities
- Asynchronous payment processing using **Redis + BullMQ**
- Background worker services for:
  - Payments
  - Webhooks
  - Refunds
- Secure webhook delivery with:
  - HMAC SHA-256 signatures
  - Automatic retries with exponential backoff
- Refund system with:
  - Full & partial refunds
  - Async refund processing
- Idempotency keys to prevent duplicate charges
- Dockerized setup for easy local execution

---

## High-Level Flow

1. Merchant creates an order
2. Payment is created in **pending** state
3. Worker processes payment asynchronously
4. Payment becomes **success / failed**
5. Webhook is delivered to merchant (with retries)
6. Refunds can be created and processed asynchronously

This is the same pattern used by real payment gateways.

---

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Queue**: Redis + BullMQ
- **Infra**: Docker, Docker Compose
- **Frontend**: React (Dashboard & Checkout)
- **Security**: API Key auth, HMAC webhooks, idempotency

---

## Running the Project

```bash
docker-compose up --build
````

### Services

* API: [http://localhost:8000](http://localhost:8000)
* Dashboard: [http://localhost:3000](http://localhost:3000)
* Checkout: [http://localhost:3001](http://localhost:3001)

---

## Test Merchant Credentials

Seeded automatically on startup:

```
API Key:    key_test_abc123
API Secret: secret_test_xyz789
Webhook Secret: whsec_test_abc123
```

---

## Key APIs (Summary)

### Create Payment (Async)

```http
POST /api/v1/payments
```

* Supports Idempotency-Key
* Returns immediately with `status: pending`
* Processing happens in background

---

### Create Refund

```http
POST /api/v1/payments/{payment_id}/refunds
```

* Supports partial & full refunds
* Refunds are processed asynchronously

---

### Webhooks

* Events:

  * payment.success
  * payment.failed
  * refund.processed
* Delivered with HMAC signature
* Automatic retries (5 attempts)

---

## Testing Webhooks

A test merchant webhook server is included.

```bash
node test-merchant/webhook-receiver.js
```

Configure webhook URL as:

```
http://host.docker.internal:4000/webhook
```

---

## Why This Project Matters

This project demonstrates:

* Event-driven architecture
* Reliable async processing
* Idempotent API design
* Retry-safe webhook delivery
* Real-world payment system patterns

These are **production-level backend skills**, not toy examples.

---
Absolutely 👍
Here’s a **small, clean, human-sounding README section** just for the **SDK**, written the way a real developer would explain it — not heavy, not marketing-style.

You can directly paste this into your `README.md`.

---

## Embeddable Checkout SDK

PayFlow provides a lightweight JavaScript SDK that merchants can embed directly into their website to accept payments.

The SDK opens a secure checkout modal using an iframe, similar to how Razorpay or Stripe Checkout works. Merchants only need to include one script and pass their `orderId`.

The checkout flow runs independently from the merchant page, and payment results are communicated back using `postMessage`.

### Usage

```html
<script src="http://localhost:3001/checkout.js"></script>
<script>
  const checkout = new PaymentGateway({
    orderId: "order_xxxxx",
    onSuccess: (res) => {
      console.log("Payment successful:", res.paymentId);
    },
    onFailure: (res) => {
      console.log("Payment failed");
    }
  });

  checkout.open();
</script>
```

---

## Notes

* All money values are stored in smallest currency units (paise)
* Workers are fully decoupled from API
* System is resilient to retries, failures, and restarts

---

## Conclusion

PayFlow Gateway shows how modern payment systems are actually built —
with queues, workers, retries, and strong separation of concerns.

This is not just a demo — it’s a **production-style architecture**.
