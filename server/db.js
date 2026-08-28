import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isSupabaseConfigured, supabaseDb } from './supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data_store.json');

const defaultData = {
  users: [],
  products: [],
  orders: [],
  settings: {
    botToken: "",
    adminChatId: "",
    storeName: "ማሺ ገበያ (Mashi Gebeya)",
    storePhone: "0911305530",
    storeAddress: "ጀሞ 1 ብሎክ 157",
    storeMapUrl: "https://maps.app.goo.gl/qu1soae2p3Xeydiq9"
  },
  telegramLogs: []
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.users) data.users = [];
    return data;
  } catch (err) {
    console.error('Error reading database file:', err);
    return defaultData;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing database file:', err);
    return false;
  }
}

function getEnvSettings() {
  const envPath = path.join(__dirname, '.env');
  const envConfig = {};
  try {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim();
            envConfig[key] = val;
          }
        }
      });
    }
  } catch (err) {
    console.error('Error parsing live .env file:', err);
  }
  return envConfig;
}

export const db = {
  // Auth Operations - Strictly read credentials from process.env with zero hardcoded fallbacks
  registerAdmin: (userData) => {
    const { name, phone, telegramUsername, email, password } = userData;
    const data = readDb();
    const existing = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return { error: 'Email already registered' };

    const newUser = {
      id: 'usr_' + Date.now(),
      name: name || 'User',
      phone: phone || '',
      telegramUsername: telegramUsername || '',
      email: email.toLowerCase(),
      password,
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    data.users.push(newUser);
    writeDb(data);
    return { user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } };
  },

  loginAdmin: (email, password) => {
    const liveEnv = getEnvSettings();
    const envAdminEmail = (liveEnv.ADMIN_EMAIL || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const envAdminPass = (liveEnv.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '').trim();

    const inputEmail = (email || '').trim().toLowerCase();
    const inputPass = (password || '').trim();

    // Verify strictly against environment variables
    if (envAdminEmail && envAdminPass && inputEmail === envAdminEmail && inputPass === envAdminPass) {
      return {
        user: {
          id: 'usr_env_admin',
          name: liveEnv.STORE_NAME || process.env.STORE_NAME || 'Control Center',
          email: inputEmail,
          role: 'admin'
        }
      };
    }

    // Check registered users in database
    const data = readDb();
    const user = data.users.find(u => u.email.toLowerCase() === inputEmail && u.password === inputPass);
    if (!user) return { error: 'Invalid email or password' };

    return { user: { id: user.id, name: user.name, email: user.email, role: user.role || 'admin' } };
  },

  getProducts: () => {
    if (isSupabaseConfigured()) {
      supabaseDb.getProducts().then(res => {
        if (res) {
          const formatted = res.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            price: p.price,
            image: p.image,
            images: p.images || [p.image],
            description: p.description || '',
            inStock: p.in_stock
          }));
          return formatted;
        }
      });
    }
    return readDb().products;
  },

  addProduct: (product) => {
    const data = readDb();
    data.products.unshift(product);
    writeDb(data);

    if (isSupabaseConfigured()) {
      supabaseDb.addProduct(product);
    }
    return product;
  },

  updateProduct: (id, updatedFields) => {
    const data = readDb();
    const index = data.products.findIndex(p => p.id === id);
    if (index !== -1) {
      data.products[index] = { ...data.products[index], ...updatedFields };
      writeDb(data);
      
      if (isSupabaseConfigured()) {
        supabaseDb.updateProduct(id, updatedFields);
      }
      return data.products[index];
    }
    return null;
  },

  deleteProduct: (id) => {
    const data = readDb();
    data.products = data.products.filter(p => p.id !== id);
    writeDb(data);

    if (isSupabaseConfigured()) {
      supabaseDb.deleteProduct(id);
    }
    return true;
  },

  getOrders: () => readDb().orders,

  addOrder: (order) => {
    const data = readDb();
    data.orders.unshift(order);
    writeDb(data);

    if (isSupabaseConfigured()) {
      supabaseDb.addOrder(order);
    }
    return order;
  },

  updateOrderStatus: (id, status) => {
    const data = readDb();
    const index = data.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      data.orders[index].status = status;
      writeDb(data);

      if (isSupabaseConfigured()) {
        supabaseDb.updateOrderStatus(id, status);
      }
      return data.orders[index];
    }
    return null;
  },

  getSettings: () => {
    const liveEnv = getEnvSettings();
    const data = readDb();
    return {
      botToken: liveEnv.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || data.settings?.botToken || '',
      adminChatId: liveEnv.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID || data.settings?.adminChatId || '',
      storeName: liveEnv.STORE_NAME || process.env.STORE_NAME || data.settings?.storeName || 'ማሺ ገበያ (Mashi Gebeya)',
      storePhone: liveEnv.STORE_PHONE || process.env.STORE_PHONE || data.settings?.storePhone || '0911305530',
      storeAddress: liveEnv.STORE_ADDRESS || process.env.STORE_ADDRESS || data.settings?.storeAddress || 'ጀሞ 1 ብሎክ 157',
      storeMapUrl: liveEnv.STORE_MAP_URL || process.env.STORE_MAP_URL || data.settings?.storeMapUrl || 'https://maps.app.goo.gl/qu1soae2p3Xeydiq9'
    };
  },
  updateSettings: (newSettings) => {
    const data = readDb();
    data.settings = { ...data.settings, ...newSettings };
    writeDb(data);

    // Sync updated settings directly to server/.env file
    try {
      const envPath = path.join(__dirname, '.env');
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf-8');
        const mapping = {
          storePhone: 'STORE_PHONE',
          storeAddress: 'STORE_ADDRESS',
          storeName: 'STORE_NAME',
          storeMapUrl: 'STORE_MAP_URL',
          botToken: 'TELEGRAM_BOT_TOKEN',
          adminChatId: 'TELEGRAM_ADMIN_CHAT_ID'
        };

        Object.entries(mapping).forEach(([settingKey, envKey]) => {
          if (newSettings[settingKey] !== undefined) {
            const val = newSettings[settingKey];
            const regex = new RegExp(`^${envKey}=.*$`, 'm');
            if (regex.test(envContent)) {
              envContent = envContent.replace(regex, `${envKey}=${val}`);
            } else {
              envContent += `\n${envKey}=${val}`;
            }
          }
        });
        fs.writeFileSync(envPath, envContent, 'utf-8');
      }
    } catch (err) {
      console.error('Error writing updated settings to .env:', err);
    }

    return db.getSettings();
  },
  addTelegramLog: (logEntry) => {
    const data = readDb();
    data.telegramLogs.unshift(logEntry);
    if (data.telegramLogs.length > 50) data.telegramLogs.pop();
    writeDb(data);
  },
  getTelegramLogs: () => readDb().telegramLogs
};
