export default async function getStoreMessages() {
  const response = await fetch("http://localhost:8000/api/storeMessages", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("فشل في جلب البيانات من السيرفر");
  }

  const data = await response.json();
  return data;
}
