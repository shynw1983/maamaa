# Payment Integration Notes

This project is a brand site that can host pickup reservations for multiple stores. Payment settings must be store-specific so each store can use its own KOMOJU merchant account, webhook secret, payout flow, and reconciliation.

## Store-specific KOMOJU env keys

Use the store id as the env key suffix in uppercase.

For Shimizu:

```env
KOMOJU_SHIMIZU_SECRET_KEY=
KOMOJU_SHIMIZU_WEBHOOK_SECRET=
KOMOJU_SHIMIZU_PAYMENT_TYPES=
```

For a future store, for example `nagoya`:

```env
KOMOJU_NAGOYA_SECRET_KEY=
KOMOJU_NAGOYA_WEBHOOK_SECRET=
KOMOJU_NAGOYA_PAYMENT_TYPES=
```

`KOMOJU_PAYMENT_TYPES` is optional. Leave it blank to use the payment methods enabled in that store's KOMOJU dashboard, or set comma-separated methods such as:

```env
KOMOJU_SHIMIZU_PAYMENT_TYPES=credit_card,paypay
```

The global fallback keys are supported for local compatibility, but new stores should not rely on them:

```env
KOMOJU_SECRET_KEY=
KOMOJU_WEBHOOK_SECRET=
KOMOJU_PAYMENT_TYPES=
```

## Webhook URL

The shared webhook endpoint is:

```text
https://<domain>/api/orders/komoju-webhook
```

Each KOMOJU merchant account can point to this same endpoint. The app resolves the order, reads its `storeId`, and verifies the signature using that store's `KOMOJU_<STORE_ID>_WEBHOOK_SECRET`.

For webhook `ping` events or events without an order, the endpoint tries all configured `KOMOJU_*_WEBHOOK_SECRET` values.

## Adding a New Store Payment Setup

1. Choose the canonical store id, for example `nagoya`.
2. Make sure orders for that store are created with `storeId: "nagoya"` and the correct display `storeName`.
3. Add store-specific env keys:

```env
KOMOJU_NAGOYA_SECRET_KEY=
KOMOJU_NAGOYA_WEBHOOK_SECRET=
KOMOJU_NAGOYA_PAYMENT_TYPES=
```

4. In that store's KOMOJU dashboard, create a webhook pointing to:

```text
https://<domain>/api/orders/komoju-webhook
```

5. Use the same value for `KOMOJU_NAGOYA_WEBHOOK_SECRET` and the KOMOJU webhook security token.
6. Confirm the store admin user has access to the same store id used on orders.
7. Run:

```sh
npm run build
```

## Current Store

Shimizu uses:

```text
storeId: shimizu
env prefix: KOMOJU_SHIMIZU_
customer status page: /stores/shimizu/orders/[orderId]
```
