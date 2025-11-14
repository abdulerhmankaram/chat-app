"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Pusher from "pusher-js";
import Link from "next/link";
import getStoreMessages from "@/ulit/getStoreMessages";
import { MdDelete } from "react-icons/md";

export default function ChatGroup() {
  const router = useRouter();
  // 🧠 الحالات (states)
  const [token, setToken] = useState(null);
  const [storedMessages, setStoredMessages] = useState([]); // رسائل Laravel القديمة
  const [messages, setMessages] = useState([]); // رسائل Pusher الجديدة
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [user, setUser] = useState([]);
  const [id, setId] = useState();
  //http://localhost:8000/api/deleteMessage/3
  // 🔹 عند تحميل الصفحة

  const deleteMessage = async (id) => {
    alert("Are you sure you want to delete this message?");
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/deleteMessage/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // حذف من الرسائل القديمة والجديدة
        setStoredMessages((prev) => prev.filter((msg) => msg.id !== id));
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  useEffect(() => {
    // 📨 جلب الرسائل القديمة من Laravel

    async function handleGetStorMessages() {
      const stor = await getStoreMessages();
      if (stor.data && Array.isArray(stor.data)) {
        setStoredMessages(stor.data);
        console.log("Old messages:", stor.data);
      } else {
        console.error("No messages found:", stor);
      }
    }

    handleGetStorMessages();

    // 🔐 التحقق من تسجيل الدخول
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("../auth/Login");
    }

    setToken(token);
    // 👤 جلب بيانات المستخدم
    async function getUser() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setUsername("Guest");
          return;
        }

        const response = await fetch("http://127.0.0.1:8000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Unauthorized");

        const data = await response.json();
        setId(data.id);
        setUsername(data.name || "Unknown");
      } catch (error) {
        console.error("Error fetching user:", error);
        setUsername("Guest");
      }
    }

    getUser();

    // 🔔 إعداد Pusher للاستماع للرسائل الجديدة
    const pusher = new Pusher("9d2bab595dfefa47756f", { cluster: "mt1" });
    const channel = pusher.subscribe("chat-channel");

    channel.bind("delete-message", (data) => {
      console.log("✅ Delete event received:", data);
      setMessages((prev) => prev.filter((msg) => msg.id !== data.id));
      setStoredMessages((prev) => prev.filter((msg) => msg.id !== data.id));
    });

    channel.bind("new-message", (data) => {
      setMessages((prev) => [...prev, data]);
      console.log("New message:", data);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  // ✅ دالة تسجيل الخروج
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    await fetch("http://127.0.0.1:8000/api/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    localStorage.removeItem("token");
    window.location.href = "../auth/Login";
  };

  // 📝 إرسال الرسالة
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await fetch("http://127.0.0.1:8000/api/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: newMessage,
        user: username || "Anonymous",
      }),
    });
    console.log("Message sent:", newMessage);
    console.log("storedMessages:", storedMessages);
    console.log("messages:", messages);
    console.log("user");

    setNewMessage("");
  };

  // 🧩 دمج الرسائل القديمة + الجديدة
  const allMessages = [...storedMessages, ...messages];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl w-full max-w-md p-6 text-white relative">
        {/* 🔹 زر Logout */}
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition"
        >
          Logout
        </button>

        <h1 className="text-2xl font-semibold text-center mb-6 text-cyan-400">
          💬 Chatme
        </h1>

        {/* 👤 اسم المستخدم */}
        <div className="mb-4 text-center">
          <span className="text-gray-300">Welcome, </span>
          <strong className="text-cyan-300">{username}</strong>
        </div>

        {/* 📨 صندوق الرسائل */}
        <div className="border border-white/10 bg-white/5 rounded-lg h-72 overflow-y-auto mb-4 p-3">
          {allMessages.length === 0 ? (
            <p className="text-center text-gray-400 mt-12">
              No messages yet 👀
            </p>
          ) : (
            allMessages.map((msg, index) => (
              <div
                key={index}
                className={`${
                  username === (msg.user?.name || msg.user)
                    ? "bg-gray-800 mb-2 p-2 rounded-lg transition"
                    : "mb-2 p-2 rounded-lg border border-white/5 bg-white/10"
                }`}
              >
                <strong className="text-cyan-300">
                  <Link href={`../profile/${msg.user?.id ?? msg.client_id}`}>
                    {msg.user?.name ?? msg.user ?? "Unknown"}
                  </Link>
                </strong>
                :{" "}
                <span className="flex items-center justify-between gap-2">
                  {msg.msg ?? msg.message}
                  {username === (msg.user?.name || msg.user) ? (
                    <span
                      className="bg-red-500 hover:bg-red-600 text-white p-1 rounded hover:cursor-pointer"
                      onClick={() => deleteMessage(msg.id)}
                    >
                      <MdDelete />
                    </span>
                  ) : (
                    <></>
                  )}
                </span>
                <small className="text-gray-400 block text-sm mt-1">
                  {msg.created_at ?? msg.time}
                </small>
              </div>
            ))
          )}
        </div>

        {/* 🧾 إدخال الرسالة */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Write your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 p-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg shadow-md transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
