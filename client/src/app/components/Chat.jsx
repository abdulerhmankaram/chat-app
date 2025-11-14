// components/Chat.jsx
"use client";
import { useEffect, useState } from "react";
import Pusher from "pusher-js";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    // الاتصال بـ Pusher
    const pusher = new Pusher("9d2bab595dfefa47756f", {
      cluster: "mt1",
    });

    // الاشتراك في القناة
    const channel = pusher.subscribe("chat-channel");

    // الاستماع للرسائل الجديدة
    channel.bind("new-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await fetch("http://127.0.0.1:8000/api/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: newMessage,
        user: username || "Anonymous",
      }),
    });

    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl w-full max-w-md p-6 text-white">
        <h1 className="text-2xl font-semibold text-center mb-6 text-cyan-400">
          💬 Chat بسيط
        </h1>

        {/* اسم المستخدم */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="اسمك"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        {/* صندوق الرسائل */}
        <div className="border border-white/10 bg-white/5 rounded-lg h-72 overflow-y-auto mb-4 p-3">
          {messages.length === 0 ? (
            <p className="text-center text-gray-400 mt-12">
              لا توجد رسائل بعد 👀
            </p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className="mb-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                <strong className="text-cyan-300">{msg.user}</strong>:{" "}
                <span>{msg.message}</span>
                <small className="text-gray-400 block text-sm mt-1">
                  {msg.time}
                </small>
              </div>
            ))
          )}
        </div>

        {/* إرسال الرسالة */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="اكتب رسالتك..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 p-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg shadow-md transition"
          >
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
}
