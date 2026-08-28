import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, RefreshCw, CheckCircle, Smartphone } from 'lucide-react';

export default function TelegramSimulator({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: '👋 ሰላም! ወደ <b>ማሺ ገበያ (Mashi Gebeya)</b> Telegram Bot እንኳን ደህና መጡ!\n\nትዕዛዞችን ለመከታተል፣ ካታጎሪ ለመመልከት ወይም እቃ ለማዘዝ የሚከተሉትን ትእዛዞች ይጠቀሙ፡\n\n/catalog - የእቃዎች ዝርዝር\n/orders - የትዕዛዝ ሁኔታ\n/contact - የሱቅ አድራሻ እና ስልክ',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [logs, setLogs] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, logs]);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/telegram/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const command = inputText.trim().toLowerCase();
    setInputText('');

    setTimeout(() => {
      let botReply = '';
      if (command.includes('/start')) {
        botReply = '👋 ሰላም! ወደ <b>ማሺ ገበያ (Mashi Gebeya)</b> Telegram Bot እንኳን ደህና መጡ!\n\n📍 አድራሻ፡ ጀሞ 1 ብሎክ 157\n📞 ስልክ፡ 0911305530';
      } else if (command.includes('/catalog')) {
        botReply = '🛍️ <b>የማሺ ገበያ ዋና ዋና ካታጎሪዎች፡</b>\n1. ⚽ ማልያዎች (Jerseys)\n2. 🧥 ቱታዎችና ጃኬቶች (Tracksuits)\n3. 👟 ጫማዎች (Shoes)\n4. 🧴 ሽቶዎችና የውበት እቃዎች (Perfumes & Care)\n5. 🍫 ቸኮሌቶች (Chocolates)';
      } else if (command.includes('/contact')) {
        botReply = '📞 <b>የማሺ ገበያ እውቂያ፡</b>\nስልክ፡ 0911305530\nአድራሻ፡ ጀሞ 1 ብሎክ 157\nGoogle Maps: https://maps.app.goo.gl/qu1soae2p3Xeydiq9';
      } else {
        botReply = `🤖 <b>ማሺ ገበያ Bot:</b> መልእክትዎ "${command}" ደርሶናል። አውቶማቲክ የትዕዛዝ ማሳወቂያ ሲኖር በዚህ ቻት ይደርስዎታል።`;
      }

      setMessages(prev => [...prev, {
        sender: 'bot',
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: 0, overflow: 'hidden', height: '620px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Telegram Top Header */}
        <div style={{ background: '#24a1de', padding: '14px 16px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fff', color: '#24a1de', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>ማሺ ገበያ Bot</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>bot • live simulator</div>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Chat Body */}
        <div style={{ flex: 1, padding: '16px', background: '#0e1621', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {messages.map((msg, idx) => (
            <div 
              key={idx}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: msg.sender === 'user' ? '#2b5278' : '#182533',
                color: '#fff',
                padding: '10px 14px',
                borderRadius: '14px',
                fontSize: '0.88rem',
                lineHeight: 1.4,
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
              <div style={{ fontSize: '0.68rem', opacity: 0.6, textAlign: 'right', marginTop: '4px' }}>
                {msg.time}
              </div>
            </div>
          ))}

          {/* System Telegram Logs */}
          {logs.length > 0 && (
            <div style={{ margin: '12px 0', padding: '10px', background: 'rgba(243, 156, 18, 0.1)', border: '1px dashed var(--accent-gold)', borderRadius: '10px', fontSize: '0.78rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '4px' }}>
                📡 ቴሌግራም አውቶማቲክ ሲስተም ሎግ (System Order Logs):
              </div>
              {logs.slice(0, 3).map((log, lIdx) => (
                <div key={lIdx} style={{ margin: '4px 0', padding: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
                  <div dangerouslySetInnerHTML={{ __html: log.text.replace(/\n/g, '<br/>') }} />
                </div>
              ))}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSendMessage} style={{ padding: '10px', background: '#17212b', display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <input
            type="text"
            className="form-input"
            placeholder="ትእዛዝ ይጻፉ (/start, /catalog, /contact)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ background: '#0e1621', borderColor: 'transparent', borderRadius: '20px' }}
          />
          <button type="submit" className="btn btn-telegram" style={{ padding: '10px 14px', borderRadius: '50%' }}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
