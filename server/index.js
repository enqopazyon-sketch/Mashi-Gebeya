import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { notifyNewOrderToTelegram, notifyOrderStatusChange, sendTelegramMessage } from './telegramBot.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

// --- AUTH API ---
app.post('/api/auth/register', (req, res) => {
  const { name, phone, telegramUsername, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const result = db.registerAdmin({ name, phone, telegramUsername, email, password });
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  res.status(201).json(result);
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const result = db.loginAdmin(email, password);
  if (result.error) {
    return res.status(401).json({ error: result.error });
  }
  res.json(result);
});

// --- PRODUCTS API ---
app.get('/api/products', (req, res) => {
  const products = db.getProducts();
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const { title, category, price, image, images, description, inStock } = req.body;
  if (!title || !price || !category) {
    return res.status(400).json({ error: 'Title, category, and price are required' });
  }

  const mainImage = image || (images && images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80');
  const imageList = Array.isArray(images) && images.length > 0 ? images : [mainImage];

  const newProduct = {
    id: 'p_' + Date.now(),
    title,
    category,
    price: Number(price),
    image: mainImage,
    images: imageList,
    description: description || '',
    inStock: inStock !== undefined ? Boolean(inStock) : true
  };

  db.addProduct(newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const updated = db.updateProduct(id, req.body);
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  res.json(updated);
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.deleteProduct(id);
  res.json({ success: true });
});

// --- ORDERS API ---
app.get('/api/orders', (req, res) => {
  const orders = db.getOrders();
  res.json(orders);
});

app.post('/api/orders', async (req, res) => {
  const { customerName, phone, address, items, paymentMethod, notes, customerEmail, telegramUsername } = req.body;

  if (!customerName || !phone || !items || !items.length) {
    return res.status(400).json({ error: 'Customer name, phone, and items are required' });
  }

  const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const newOrder = {
    id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    customerName,
    phone,
    customerEmail: customerEmail || '',
    telegramUsername: telegramUsername || '',
    address: address || 'ጀሞ 1 ብሎክ 157',
    items,
    paymentMethod: paymentMethod || 'Direct Order',
    notes: notes || '',
    totalAmount,
    status: 'Pending',
    date: new Date().toISOString()
  };

  db.addOrder(newOrder);

  const telegramResult = await notifyNewOrderToTelegram(newOrder);

  res.status(201).json({
    order: newOrder,
    telegramNotification: telegramResult
  });
});

app.patch('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const updatedOrder = db.updateOrderStatus(id, status);
  if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });

  const telegramResult = await notifyOrderStatusChange(updatedOrder);

  res.json({
    order: updatedOrder,
    telegramNotification: telegramResult
  });
});

// --- STATS API ---
app.get('/api/stats', (req, res) => {
  const products = db.getProducts();
  const orders = db.getOrders();

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalAmount : 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;

  res.json({
    totalProducts: products.length,
    totalOrders: orders.length,
    pendingOrders,
    totalRevenue
  });
});

// --- SETTINGS & TELEGRAM SIMULATOR API ---
app.get('/api/settings', (req, res) => {
  res.json(db.getSettings());
});

app.post('/api/settings', (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

app.get('/api/telegram/logs', (req, res) => {
  res.json(db.getTelegramLogs());
});

app.post('/api/telegram/test', async (req, res) => {
  const { message } = req.body;
  const text = message || '🧪 <b>የቴሌግራም ቦት ፍተሻ (Test Notification) ከ ማሺ ገበያ!</b>\n\nሲስተሙ በተሳካ ሁኔታ እየሰራ ይገኛል።';
  const result = await sendTelegramMessage(text);
  res.json(result);
});

// --- HEALTH & KEEP-ALIVE API (Prevents Render.com Sleep) ---
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Mashi Gebeya Server', 
    uptime: Math.floor(process.uptime()), 
    timestamp: new Date().toISOString() 
  });
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('<h1>ማሺ ገበያ Backend API is running on port ' + PORT + '</h1>');
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mashi Gebeya Backend Server running at http://localhost:${PORT}`);

  // Render.com Auto Keep-Alive Self-Ping Interval (Runs every 14 minutes to prevent free tier sleep)
  const KEEP_ALIVE_INTERVAL = 14 * 60 * 1000;
  setInterval(async () => {
    const renderUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    try {
      const res = await fetch(`${renderUrl}/api/health`);
      if (res.ok) {
        console.log(`[Render Keep-Alive]: Self-ping successful at ${new Date().toLocaleTimeString()}`);
      }
    } catch (err) {
      // Quiet fail if offline
    }
  }, KEEP_ALIVE_INTERVAL);
});
