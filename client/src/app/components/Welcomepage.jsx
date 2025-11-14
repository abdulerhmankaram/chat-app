"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
export default function WelcomePage() {
  const router = useRouter();
  const [token, setToken] = useState(null);

  // ✅ اقرأ التوكن بعد ما الصفحة تتحمل في المتصفح
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  // ✅ دالة تسجيل الخروج
  const handleLogout = async () => {
    const response = await fetch("http://127.0.0.1:8000/api/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Unauthorized");
    } else {
      localStorage.removeItem("token");
      window.location.href = "./auth/Login";
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      {/* الهيدر */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-lg shadow-md">
        <h1 className="text-2xl font-bold text-cyan-400">ChatMe</h1>
        {token ? (
          <>
            <button
              onClick={handleLogout}
              className="cursor-pointer absolute top-4 right-4 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="space-x-3">
            <button
              onClick={() => router.push("./auth/login")}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg shadow-md transition"
            >
              Login
            </button>
            <button
              onClick={() => router.push("./auth/Register")}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-cyan-400 rounded-lg transition"
            >
              Register
            </button>
          </div>
        )}
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex flex-col items-center justify-center flex-1 text-center">
        <h2 className="text-5xl md:text-6xl font-extrabold text-cyan-400 mb-4 drop-shadow-lg">
          Welcome to <span className="text-white">ChatMe</span>
        </h2>
        <p className="text-gray-300 text-lg max-w-md mb-8">
          دردش مع أصدقائك في الوقت الحقيقي، واستمتع بتجربة سلسة وممتعة.
        </p>

        <button
          onClick={() =>
            router.push(`${token ? "./chat/ChatGroup" : "./auth/Login"}`)
          }
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-xl shadow-lg font-semibold transition"
        >
          Get Started 🚀
        </button>
      </main>

      {/* الفوتر */}
      <footer className="text-center text-gray-400 text-sm py-4 border-t border-white/10">
        © {new Date().getFullYear()} ChatMe — Built with ❤️ by Abdulrahman
      </footer>
    </div>
  );
}
