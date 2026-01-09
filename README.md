# PayFlow Gateway

PayFlow Gateway is a simplified, end-to-end **payment gateway system** inspired by real-world platforms like Razorpay and Stripe.  
It demonstrates how merchants create orders, customers complete payments via a hosted checkout, and merchants track transactions through a dashboard.

This project focuses on **clean backend architecture**, **secure API design**, and **realistic payment workflows** rather than unnecessary features.

---

## Features

### Merchant Side
- API-key based authentication
- Create orders securely
- View payments and transaction analytics
- Merchant dashboard with:
  - Total transactions
  - Total amount collected
  - Success rate
  - Transaction history

### Customer Side
- Public hosted checkout page
- No login required
- Supports:
  - UPI payments
  - Card payments
- Real-time payment status polling

### System Features
- Public & private API separation
- Payment processing simulation
- Secure handling of sensitive routes
- Dockerized setup for easy run

---

## How the System Works (High Level)

1. **Merchant creates an order** using authenticated APIs.
2. The backend returns an `order_id`.
3. The `order_id` is embedded into a **public checkout URL**.
4. Customer opens checkout and completes payment.
5. Payment status updates asynchronously.
6. Merchant views payments on the dashboard.

This is the **same workflow used by real payment gateways**.

---

## Complete Workflow (Step-by-Step)

### Create Order (Merchant)

```http
POST /api/v1/orders
````

Headers:

```
X-Api-Key
X-Api-Secret
```

Body:

```json
{
  "amount": 50000,
  "currency": "INR",
  "receipt": "receipt_001"
}
```

Response:

```json
{
  "id": "order_xxxxx",
  "status": "created"
}
```

> Amounts are stored in **smallest currency units (paise)** to avoid floating-point issues.

---

### Generate Checkout Link

```text
http://localhost:3001/checkout?order_id=order_xxxxx
```

This link is shared with the customer.

---

### Customer Completes Payment

* Customer selects payment method (UPI / Card)
* Enters details
* Payment is processed
* Status updates to **success / failed**

---

### Merchant Views Dashboard

Merchant dashboard fetches data using authenticated APIs and displays:

* Total transactions
* Total amount collected
* Success rate
* Detailed transaction list

---

## Authentication Design

* **Merchant APIs** use API Key & Secret
* **Public APIs** (checkout, order fetch) do NOT require authentication
* Sensitive logic is isolated inside service layers

This separation ensures **security and scalability**.

---

## Running the Project (One Command)

```bash
docker-compose up -d --build
```

### Access URLs

* Backend API: `http://localhost:8000`
* Merchant Dashboard: `http://localhost:3000`
* Checkout Page: `http://localhost:3001`

---

## Test Merchant Credentials

These are automatically seeded on startup.

```
API Key: key_test_abc123
API Secret: secret_test_xyz789
```

---

## Design Decisions

* Money stored as integers (paise) to avoid precision bugs
* No customer login (matches real payment gateways)
* Public checkout separated from merchant dashboard
* Service layer used for business logic
* Polling used to simulate async payment confirmation

---

## Possible Future Enhancements

* Webhook support
* Refund APIs
* Multiple merchants
* Payment analytics charts
* Rate limiting & monitoring

---

## Conclusion

This project demonstrates a **realistic payment gateway architecture** with clear separation of concerns, secure APIs, and an end-to-end payment flow.