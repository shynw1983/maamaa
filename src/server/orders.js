const { randomUUID } = require("crypto");

let sqlClientPromise;

const getSql = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!sqlClientPromise) {
    sqlClientPromise = import("@neondatabase/serverless").then(({ neon }) => neon(process.env.DATABASE_URL));
  }

  return sqlClientPromise;
};

const normalizeOrder = (row) => ({
  orderId: row.order_id,
  pickupCode: row.pickup_code,
  storeId: row.store_id,
  storeName: row.store_name,
  status: row.status,
  paymentStatus: row.payment_status,
  paymentProvider: row.payment_provider || "counter",
  paymentReference: row.payment_reference || "",
  receiptUrl: row.receipt_url || "",
  paymentUpdatedAt: row.payment_updated_at ? new Date(row.payment_updated_at).toISOString() : "",
  drink: row.order_title,
  size: row.item_summary,
  temperature: row.customer_name,
  sweetness: row.customer_phone,
  ice: row.customer_note || "",
  option: row.fulfillment_label,
  toppings: row.item_summary,
  pickupDate: row.pickup_date,
  pickupTime: row.pickup_time,
  amount: Number(row.amount),
  currency: row.currency,
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : "",
  updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : "",
  paidAt: row.paid_at ? new Date(row.paid_at).toISOString() : "",
});

const listOrders = async ({ status, paymentStatus, storeId, storeIds, query } = {}) => {
  const sql = await getSql();
  const scopedStoreIds = Array.isArray(storeIds) && storeIds.length ? storeIds : null;
  if (scopedStoreIds) {
    const rows = await sql`
      select *
      from orders
      where (${status || null}::text is null or status = ${status || null})
        and (${paymentStatus || null}::text is null or payment_status = ${paymentStatus || null})
        and (${storeId || null}::text is null or store_id = ${storeId || null})
        and store_id = any(${scopedStoreIds}::text[])
        and (
          ${query || null}::text is null
          or pickup_code ilike ${query ? `%${query}%` : null}
          or order_title ilike ${query ? `%${query}%` : null}
          or customer_name ilike ${query ? `%${query}%` : null}
        )
      order by pickup_date desc, pickup_time desc, created_at desc
    `;
    return rows.map(normalizeOrder);
  }

  const rows = await sql`
    select *
    from orders
    where (${status || null}::text is null or status = ${status || null})
      and (${paymentStatus || null}::text is null or payment_status = ${paymentStatus || null})
      and (${storeId || null}::text is null or store_id = ${storeId || null})
      and (
        ${query || null}::text is null
        or pickup_code ilike ${query ? `%${query}%` : null}
        or order_title ilike ${query ? `%${query}%` : null}
        or customer_name ilike ${query ? `%${query}%` : null}
      )
    order by pickup_date desc, pickup_time desc, created_at desc
  `;
  return rows.map(normalizeOrder);
};

const findOrder = async (predicate) => (await listOrders()).find(predicate) || null;

const createOrder = async ({
  pickupCode,
  storeId,
  storeName,
  drink,
  size,
  temperature,
  sweetness,
  ice,
  option,
  toppings,
  pickupDate,
  pickupTime,
  amount,
}) => {
  const sql = await getSql();
  const orderId = randomUUID();
  const rows = await sql`
    insert into orders (
      order_id,
      pickup_code,
      store_id,
      store_name,
      status,
      payment_status,
      order_title,
      item_summary,
      customer_name,
      customer_phone,
      customer_note,
      fulfillment_label,
      pickup_date,
      pickup_time,
      amount,
      currency
    ) values (
      ${orderId},
      ${pickupCode},
      ${storeId},
      ${storeName},
      'pending_payment',
      'pending',
      ${drink},
      ${size},
      ${temperature},
      ${sweetness},
      ${ice},
      ${option},
      ${pickupDate},
      ${pickupTime},
      ${amount},
      'JPY'
    )
    returning *
  `;
  return normalizeOrder(rows[0]);
};

const updateOrder = async (order, fields) => {
  const sql = await getSql();
  const rows = await sql`
    update orders
    set
      status = coalesce(${fields.status ?? null}, status),
      payment_status = coalesce(${fields.paymentStatus ?? null}, payment_status),
      payment_provider = coalesce(${fields.paymentProvider ?? null}, payment_provider),
      payment_reference = coalesce(${fields.paymentReference ?? null}, payment_reference),
      receipt_url = coalesce(${fields.receiptUrl ?? null}, receipt_url),
      payment_updated_at = coalesce(${fields.paymentUpdatedAt ?? null}, payment_updated_at),
      paid_at = coalesce(${fields.paidAt ?? null}, paid_at),
      updated_at = now()
    where order_id = ${order.orderId}
    returning *
  `;
  return normalizeOrder(rows[0]);
};

module.exports = {
  listOrders,
  findOrder,
  createOrder,
  updateOrder,
};
