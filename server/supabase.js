import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
};

async function supabaseFetch(endpoint, method = 'GET', body = null) {
  if (!isSupabaseConfigured()) return null;

  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  try {
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(url, options);
    if (!res.ok) {
      const errText = await res.text();
      console.error(`Supabase API error (${endpoint}):`, errText);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`Supabase network error (${endpoint}):`, err);
    return null;
  }
}

export const supabaseDb = {
  getProducts: async () => {
    return await supabaseFetch('products?select=*&order=created_at.desc');
  },
  addProduct: async (product) => {
    const dbPayload = {
      id: product.id,
      title: product.title,
      category: product.category,
      price: product.price,
      image: product.image,
      images: product.images || [product.image],
      description: product.description || '',
      in_stock: product.inStock !== undefined ? product.inStock : true
    };
    const res = await supabaseFetch('products', 'POST', dbPayload);
    return res ? res[0] : null;
  },
  updateProduct: async (id, updatedFields) => {
    const dbPayload = { ...updatedFields };
    if (dbPayload.inStock !== undefined) {
      dbPayload.in_stock = dbPayload.inStock;
      delete dbPayload.inStock;
    }
    const res = await supabaseFetch(`products?id=eq.${id}`, 'PATCH', dbPayload);
    return res ? res[0] : null;
  },
  deleteProduct: async (id) => {
    const res = await supabaseFetch(`products?id=eq.${id}`, 'DELETE');
    return Boolean(res);
  },
  getOrders: async () => {
    return await supabaseFetch('orders?select=*&order=created_at.desc');
  },
  addOrder: async (order) => {
    const dbPayload = {
      id: order.id,
      customer_name: order.customerName,
      phone: order.phone,
      customer_email: order.customerEmail || '',
      telegram_username: order.telegramUsername || '',
      address: order.address,
      payment_method: order.paymentMethod,
      notes: order.notes,
      total_amount: order.totalAmount,
      items: order.items,
      status: order.status || 'Pending'
    };
    const res = await supabaseFetch('orders', 'POST', dbPayload);
    return res ? res[0] : null;
  },
  updateOrderStatus: async (id, status) => {
    const res = await supabaseFetch(`orders?id=eq.${id}`, 'PATCH', { status });
    return res ? res[0] : null;
  }
};
