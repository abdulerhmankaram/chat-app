"use client";
import React, { useEffect, useState, use } from "react";

export default function Page({ params }) {
  const { id } = use(params); // لأن params دلوقتي Promise في Next 15
  const [data, setData] = useState(null);

  useEffect(() => {
    async function getUser() {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/user/${id}`);
        if (!res.ok) throw new Error("User not found");
        const data = await res.json();
        setData(data);
      } catch (err) {
        console.error(err);
      }
    }
    getUser();
  }, [id]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center h-screen text-cyan-400">
      <h1 className="text-2xl">{data.name}</h1>
      <p>{data.email}</p>
    </div>
  );
}
