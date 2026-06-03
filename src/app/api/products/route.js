const { listStoreProducts } = require("../../../server/store-products");

export async function GET() {
  return Response.json(
    {
      products: await listStoreProducts("shimizu"),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
