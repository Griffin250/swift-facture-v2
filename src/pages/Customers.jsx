"use client";

import React from "react";

export type Customer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  vatId?: string;
  currency?: string; // default currency
};

const emptyCustomer = (): Customer => ({ id: crypto.randomUUID(), name: "", email: "", phone: "", address: "", vatId: "", currency: "EUR" });

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [filter, setFilter] = React.useState("");

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("customers");
      if (raw) setCustomers(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (next: Customer[]) => {
    setCustomers(next);
    try { localStorage.setItem("customers", JSON.stringify(next)); } catch {}
  };

  const add = () => persist([emptyCustomer(), ...customers]);
  const remove = (id: string) => persist(customers.filter((c) => c.id !== id));
  const update = (id: string, patch: Partial<Customer>) =>
    persist(customers.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const filtered = customers.filter((c) =>
    [c.name, c.email, c.phone, c.address, c.vatId].join(" ").toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-10 lg:px-[100px] pb-16">
      <div className="mt-6 mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
        <div className="flex gap-2">
          <input
            placeholder="Search customers..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-64 rounded border border-border bg-input px-3 py-2 text-sm"
          />
          <button onClick={add} className="rounded-md bg-[#0F5F5C] text-[#00D9AA] px-4 py-2 text-sm hover:opacity-90">Add Customer</button>
        </div>
      </div>

      <div className="rounded-sm bg-card p-6 shadow-[1px_1px_16px_0px_rgba(0,0,0,0.06)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Email</th>
              <th className="py-2 pr-3">Phone</th>
              <th className="py-2 pr-3">Address</th>
              <th className="py-2 pr-3">VAT ID</th>
              <th className="py-2 pr-3">Currency</th>
              <th className="py-2 w-40"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-b-0">
                <td className="py-2 pr-3">
                  <input value={c.name} onChange={(e) => update(c.id, { name: e.target.value })} className="w-full rounded border border-border bg-input px-3 py-2" />
                </td>
                <td className="py-2 pr-3">
                  <input value={c.email} onChange={(e) => update(c.id, { email: e.target.value })} className="w-full rounded border border-border bg-input px-3 py-2" />
                </td>
                <td className="py-2 pr-3">
                  <input value={c.phone} onChange={(e) => update(c.id, { phone: e.target.value })} className="w-full rounded border border-border bg-input px-3 py-2" />
                </td>
                <td className="py-2 pr-3">
                  <input value={c.address} onChange={(e) => update(c.id, { address: e.target.value })} className="w-full rounded border border-border bg-input px-3 py-2" />
                </td>
                <td className="py-2 pr-3">
                  <input value={c.vatId} onChange={(e) => update(c.id, { vatId: e.target.value })} className="w-full rounded border border-border bg-input px-3 py-2" />
                </td>
                <td className="py-2 pr-3">
                  <select value={c.currency} onChange={(e) => update(c.id, { currency: e.target.value })} className="w-full rounded border border-border bg-input px-3 py-2">
                    <option>EUR</option>
                    <option>USD</option>
                    <option>GBP</option>
                  </select>
                </td>
                <td className="py-2 flex gap-2">
                  <button onClick={() => remove(c.id)} className="rounded-md border border-border px-3 py-2 text-xs hover:bg-accent">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-muted">Tip: Link a default customer from here in your invoice by copying the name.</p>
    </div>
  );
};

export default CustomersPage;