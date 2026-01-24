import axios from "axios";

export type Product = {
  product_sn: string;
  purchase_date: string;
  name: string;
  price: number;
  vendor: string;
  description: string;
};

export type Rental = {
  product_sn: string;
  start_date: string;
  transaction_type: number;
  end_date: string | null;
  qty: number;
  description: string;
};

const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === "true";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

// ======================
// DEMO STORE (in-memory)
// ======================
let demoProducts: Product[] = [
  {
    product_sn: "ABCDE123",
    purchase_date: "2023-07-10 10:00:00",
    name: "Product 1",
    price: 100.5,
    vendor: "Vendor A",
    description: "Description for Product 1",
  },
  {
    product_sn: "FGHIJ456",
    purchase_date: "2023-07-11 11:30:00",
    name: "Product 2",
    price: 150.75,
    vendor: "Vendor B",
    description: "Description for Product 2",
  },
];

let demoRentals: Rental[] = [
  {
    product_sn: "ABCDE123",
    start_date: "2024-07-19 17:19:10",
    transaction_type: 1,
    end_date: "2024-07-20 18:00:00",
    qty: 1,
    description: "",
  },
];

// ======================
// Date helpers
// ======================
const pad = (n: number) => String(n).padStart(2, "0");

export const toSqlDatetime = (d: Date | string) => {
  if (typeof d === "string") return d;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const toIsoForUrl = (d: Date | string) => {
  if (d instanceof Date) return d.toISOString();

  // if already parseable
  const native = new Date(d);
  if (!Number.isNaN(native.getTime())) return native.toISOString();

  const guess = new Date(d.replace(" ", "T") + "Z");
  if (!Number.isNaN(guess.getTime())) return guess.toISOString();

  return d;
};

// ======================
// API FUNCTIONS
// ======================
export async function getProducts(): Promise<Product[]> {
  if (DEMO_MODE) return [...demoProducts];
  const res = await axios.get(`${API_BASE_URL}/products`);
  return res.data;
}

export async function createProduct(p: Product): Promise<void> {
  if (DEMO_MODE) {
    demoProducts = [p, ...demoProducts];
    return;
  }
  await axios.post(`${API_BASE_URL}/products`, p);
}

export async function updateProduct(product_sn: string, p: Product): Promise<void> {
  if (DEMO_MODE) {
    demoProducts = demoProducts.map((x) => (x.product_sn === product_sn ? p : x));
    return;
  }
  await axios.put(`${API_BASE_URL}/products/${product_sn}`, p);
}

export async function deleteProduct(product_sn: string): Promise<void> {
  if (DEMO_MODE) {
    demoProducts = demoProducts.filter((x) => x.product_sn !== product_sn);
    demoRentals = demoRentals.filter((r) => r.product_sn !== product_sn);
    return;
  }
  await axios.delete(`${API_BASE_URL}/products/${product_sn}`);
}

export async function getRentals(product_sn: string): Promise<Rental[]> {
  if (DEMO_MODE) return demoRentals.filter((r) => r.product_sn === product_sn);
  const res = await axios.get(`${API_BASE_URL}/rentals/${product_sn}`);
  return res.data;
}

export async function createRental(
  r: Omit<Rental, "start_date" | "end_date"> & {
    start_date: Date | string;
    end_date: Date | string | null;
  }
): Promise<void> {
  const payload: Rental = {
    ...r,
    start_date: toSqlDatetime(r.start_date),
    end_date: r.end_date ? toSqlDatetime(r.end_date) : null,
  };

  if (DEMO_MODE) {
    demoRentals = [payload, ...demoRentals];
    return;
  }

  await axios.post(`${API_BASE_URL}/rentals`, payload);
}

export async function updateRental(
  product_sn: string,
  start_date: Date | string,
  r: Partial<Rental> & { start_date?: Date | string; end_date?: Date | string | null }
): Promise<void> {
  const startKeySql = toSqlDatetime(start_date);

  const payload: Partial<Rental> = {
    ...r,
    ...(r.start_date ? { start_date: toSqlDatetime(r.start_date) } : {}),
    ...(r.end_date !== undefined ? { end_date: r.end_date ? toSqlDatetime(r.end_date) : null } : {}),
  };

  if (DEMO_MODE) {
    demoRentals = demoRentals.map((x) => {
      if (x.product_sn === product_sn && x.start_date === startKeySql) {
        return { ...x, ...payload, start_date: x.start_date };
      }
      return x;
    });
    return;
  }

  const startIso = toIsoForUrl(start_date);
  const encoded = encodeURIComponent(startIso);
  await axios.put(`${API_BASE_URL}/rentals/${product_sn}/${encoded}`, payload);
}

export async function deleteRental(product_sn: string, start_date: Date | string): Promise<void> {
  const startKeySql = toSqlDatetime(start_date);

  if (DEMO_MODE) {
    demoRentals = demoRentals.filter(
      (x) => !(x.product_sn === product_sn && x.start_date === startKeySql)
    );
    return;
  }

  const startIso = toIsoForUrl(start_date);
  const encoded = encodeURIComponent(startIso);
  await axios.delete(`${API_BASE_URL}/rentals/${product_sn}/${encoded}`);
}

export function resetDemoData() {
  demoProducts = [];
  demoRentals = [];
}
