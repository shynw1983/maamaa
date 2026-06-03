import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "../../../components/admin-shell";
import { AdminLogoutButton } from "../../../components/admin-logout-button";

const { listActiveStores, listStoreProducts } = require("../../../server/store-products");
const { getStoreOperation } = require("../../../server/store-operations");
const { getSessionFromCookieStore, filterAccessibleStores } = require("../../../server/admin-auth");

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const session = getSessionFromCookieStore(cookieStore);
  if (!session) redirect("/admin/login");

  const stores = filterAccessibleStores(session, await listActiveStores());
  const primaryStore = stores.find((store) => store.isPrimary) || stores[0];
  const [products, operation] = await Promise.all([
    primaryStore ? listStoreProducts(primaryStore.id) : [],
    primaryStore ? getStoreOperation(primaryStore.id) : null,
  ]);
  const soldOut = products.filter((product) => !product.isAvailable || !product.websiteEnabled);
  const availableProducts = products.filter((product) => product.isAvailable && product.websiteEnabled);

  return (
    <AdminShell
      eyebrow="overview"
      title="ダッシュボード"
      activePath="/admin/dashboard"
      actions={<AdminLogoutButton />}
      currentUser={session}
    >
      <section className="admin-hero-panel">
        <div>
          <span>{primaryStore?.name || "店舗未設定"}</span>
          <h2>営業設定</h2>
          <p>
            {operation && !operation.reservationsEnabled
              ? "現在、この店舗の予約受付は停止中です。"
              : "現在、この店舗の予約受付は有効です。"}
          </p>
        </div>
        <div className="admin-hero-pills">
          <span>{operation?.reservationsEnabled === false ? "予約停止中" : "予約受付中"}</span>
          <span>{availableProducts.length} 商品販売中</span>
          <span>{soldOut.length} 商品停止中</span>
        </div>
      </section>

      <section className="admin-metric-grid">
        <article>
          <span>店舗数</span>
          <strong>{stores.length}</strong>
        </article>
        <article>
          <span>販売中の商品</span>
          <strong>{availableProducts.length}</strong>
        </article>
        <article>
          <span>停止中の商品</span>
          <strong>{soldOut.length}</strong>
        </article>
        <article>
          <span>予約受付</span>
          <strong>{operation?.reservationsEnabled === false ? "停止" : "有効"}</strong>
        </article>
      </section>

      <section className="admin-two-column">
        <article className="admin-panel">
          <div className="admin-panel-heading">
            <h2>停止中の商品</h2>
          </div>
          <div className="admin-mini-list">
            {soldOut.slice(0, 8).map((product) => (
              <div key={product.drinkId}>
                <strong>{product.name}</strong>
                <span>{product.categoryLabel}</span>
                <em>{product.isAvailable ? "予約停止" : "売り切れ"}</em>
              </div>
            ))}
            {!soldOut.length ? <p>停止中の商品はありません。</p> : null}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-heading">
            <h2>店舗</h2>
          </div>
          <div className="admin-mini-list">
            {stores.map((store) => (
              <div key={store.id}>
                <strong>{store.name}</strong>
                <span>{store.address || "住所未設定"}</span>
                <em>{store.isPrimary ? "メイン" : "店舗"}</em>
              </div>
            ))}
            {!stores.length ? <p>表示できる店舗がありません。</p> : null}
          </div>
        </article>
      </section>
    </AdminShell>
  );
}
