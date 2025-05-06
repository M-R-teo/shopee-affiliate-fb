import { useState, useEffect } from "react";
import axios from "axios";

export default function PostPage() {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("postHistory");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult("");
    try {
      // 1. Lấy thông tin sản phẩm từ link Shopee gốc
      const productInfo = await axios.post("/api/product-info", { url });
      const { title, image, description, affiliateUrl } = productInfo.data;

      // 2. Tạo nội dung bài viết
      const content = `📦 ${title}\n📝 ${description}\n🔗 ${affiliateUrl}`;

      // 3. Đăng bài lên Facebook Fanpage (ảnh + caption)
      const res = await axios.post("/api/post", {
        image,
        caption: content,
        token
      });

      // 4. Lưu lịch sử
      const newEntry = {
        time: new Date().toLocaleString(),
        postId: res.data.postId,
        url: affiliateUrl,
        title
      };
      const updated = [newEntry, ...history];
      setHistory(updated);
      localStorage.setItem("postHistory", JSON.stringify(updated));
      setResult(`✅ Đăng thành công! ID bài viết: ${res.data.postId}`);
    } catch (err) {
      setResult(`❌ Lỗi: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">📢 Đăng bài Shopee Affiliate</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">🔗 Link sản phẩm Shopee (gốc):</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            placeholder="https://shopee.vn/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">🔐 Facebook Page Access Token:</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            placeholder="Nhập token để đăng bài"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Đang đăng..." : "Đăng bài lên Fanpage"}
        </button>
      </form>
      {result && <p className="mt-4 text-sm whitespace-pre-line">{result}</p>}

      <div className="mt-6">
        <h2 className="font-semibold mb-2">📜 Lịch sử bài đăng:</h2>
        <ul className="text-sm list-disc pl-5 space-y-1">
          {history.map((item, i) => (
            <li key={i}>
              <strong>{item.time}</strong>: {item.title} - ID bài viết {item.postId} - <a href={item.url} target="_blank" className="text-blue-500 underline">Link</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
