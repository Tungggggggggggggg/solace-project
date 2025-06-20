import React, { useState } from "react";

interface ReportPostModalProps {
  postId: string;
  reporterId: string;
  onClose: () => void;
}

const REPORT_REASONS = [
  "Vấn đề liên quan đến người dưới 18 tuổi",
  "Bắt nạt, quấy rối hoặc lăng mạ/lạm dụng/ngược đãi",
  "Tự tử hoặc tự gây thương tích",
  "Nội dung mang tính bạo lực, thù ghét hoặc gây phiền toái",
  "Bán hoặc quảng cáo mặt hàng bị hạn chế",
  "Nội dung người lớn",
  "Thông tin sai sự thật, lừa đảo hoặc gian lận",
  "Quyền sở hữu trí tuệ",
  "Tôi không muốn xem nội dung này",
];

export default function ReportPostModal({ postId, reporterId, onClose }: ReportPostModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedReason) {
      setError("Vui lòng chọn lý do báo cáo.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          reporter_id: reporterId,
          reason: selectedReason,
          description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi báo cáo");
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  if (success)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50" onClick={onClose}>
        <div className="bg-white rounded-xl p-6 w-full max-w-md text-center" onClick={e => e.stopPropagation()}>
          <h2 className="text-xl font-bold mb-4">Báo cáo thành công!</h2>
          <p>Cảm ơn bạn đã giúp chúng tôi xây dựng cộng đồng an toàn hơn.</p>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50" onClick={onClose}>
      <form
        className="bg-white rounded-xl p-6 w-full max-w-md"
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Báo cáo</h2>
          <button type="button" onClick={onClose} className="text-gray-500 text-2xl">&times;</button>
        </div>
        <div className="mb-2 font-semibold">Tại sao bạn báo cáo bài viết này?</div>
        <div className="mb-4 text-gray-500 text-sm">
          Nếu bạn nhận thấy ai đó đang gặp nguy hiểm, đừng chần chừ mà hãy tìm ngay sự giúp đỡ trước khi báo cáo với chúng tôi.
        </div>
        <div className="space-y-2 mb-4">
          {REPORT_REASONS.map((reason) => (
            <label
              key={reason}
              className={`block p-2 rounded-lg border cursor-pointer ${
                selectedReason === reason
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="reason"
                value={reason}
                checked={selectedReason === reason}
                onChange={() => setSelectedReason(reason)}
                className="mr-2"
              />
              {reason}
            </label>
          ))}
        </div>
        <textarea
          className="w-full border rounded-lg p-2 mb-2"
          placeholder="Mô tả chi tiết (không bắt buộc)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold"
          disabled={loading}
        >
          {loading ? "Đang gửi..." : "Gửi báo cáo"}
        </button>
      </form>
    </div>
  );
} 