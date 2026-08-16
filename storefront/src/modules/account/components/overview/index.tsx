import { Container } from "@medusajs/ui"
import ChevronDown from "@modules/common/icons/chevron-down"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import User from "@modules/common/icons/user"
import MapPin from "@modules/common/icons/map-pin"
import Package from "@modules/common/icons/package"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

/**
 * Account Overview Component.
 * Displays customer greeting, full account name, email badge,
 * profile completion stats, and recent order history.
 */
const Overview = ({ customer, orders }: OverviewProps) => {
  // Construct full account display name
  const fullName = [customer?.first_name, customer?.last_name]
    .filter(Boolean)
    .join(" ")
  const accountDisplayName = fullName || customer?.email || "Valued Customer"

  return (
    <div data-testid="overview-page-wrapper" className="w-full">
      {/* ── Welcome Header with Account Name ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-[var(--surface-border)]">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]"
            data-testid="welcome-message"
            data-value={accountDisplayName}
          >
            Hello, {accountDisplayName}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Welcome to your SYA Account portal.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 font-semibold w-fit">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span data-testid="customer-email" data-value={customer?.email}>
            {customer?.email}
          </span>
        </div>
      </div>

      {/* ── Profile Stats & Completion ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-8 border-b border-[var(--surface-border)]">
        <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--bg-card)] p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <User size={24} />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">
              Profile
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                className="text-2xl font-black text-[var(--text-primary)]"
                data-testid="customer-profile-completion"
                data-value={getProfileCompletion(customer)}
              >
                {getProfileCompletion(customer)}%
              </span>
              <span className="text-xs text-[var(--text-secondary)]">Completed</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--bg-card)] p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <MapPin size={24} />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">
              Addresses
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                className="text-2xl font-black text-[var(--text-primary)]"
                data-testid="addresses-count"
                data-value={customer?.addresses?.length || 0}
              >
                {customer?.addresses?.length || 0}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">Saved</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--bg-card)] p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <Package size={24} />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">
              Total Orders
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-[var(--text-primary)]">
                {orders?.length || 0}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">Placed</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Orders ── */}
      <div className="pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Recent Orders</h2>
          {orders && orders.length > 5 && (
            <LocalizedClientLink
              href="/account/orders"
              className="text-xs font-semibold text-amber-500 hover:underline"
            >
              View all orders →
            </LocalizedClientLink>
          )}
        </div>

        <ul className="flex flex-col gap-y-3" data-testid="orders-wrapper">
          {orders && orders.length > 0 ? (
            orders.slice(0, 5).map((order) => (
              <li key={order.id} data-testid="order-wrapper" data-value={order.id}>
                <LocalizedClientLink href={`/account/orders/details/${order.id}`}>
                  <Container className="bg-[var(--bg-card)] border border-[var(--surface-border)] hover:border-amber-500/50 transition rounded-xl flex justify-between items-center p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs flex-1">
                      <div>
                        <span className="text-[var(--text-muted)] block">Order Number</span>
                        <span className="font-bold text-[var(--text-primary)]" data-testid="order-id" data-value={order.display_id}>
                          #{order.display_id}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)] block">Date</span>
                        <span className="text-[var(--text-secondary)]" data-testid="order-created-date">
                          {new Date(order.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[var(--text-muted)] block">Amount</span>
                        <span className="font-bold text-amber-500" data-testid="order-amount">
                          {convertToLocale({
                            amount: order.total,
                            currency_code: order.currency_code,
                          })}
                        </span>
                      </div>
                    </div>
                    <button
                      className="flex items-center justify-center p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      data-testid="open-order-button"
                      aria-label={`Go to order #${order.display_id}`}
                    >
                      <ChevronDown className="-rotate-90" />
                    </button>
                  </Container>
                </LocalizedClientLink>
              </li>
            ))
          ) : (
            <div className="p-8 rounded-2xl border border-dashed border-[var(--surface-border)] text-center text-xs text-[var(--text-secondary)]">
              No recent orders found. Browse our catalog to place your first order.
            </div>
          )}
        </ul>
      </div>
    </div>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  let count = 0
  if (!customer) return 0
  if (customer.email) count++
  if (customer.first_name && customer.last_name) count++
  if (customer.phone) count++
  const billingAddress = customer.addresses?.find((addr) => addr.is_default_billing)
  if (billingAddress) count++
  return (count / 4) * 100
}

export default Overview
