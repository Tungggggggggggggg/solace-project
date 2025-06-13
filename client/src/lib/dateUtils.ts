export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Chuyển đổi sang múi giờ Việt Nam (UTC+7)
  const vietnamTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));

  // Lấy các thành phần thời gian
  const hours = vietnamTime.getHours().toString().padStart(2, '0');
  const minutes = vietnamTime.getMinutes().toString().padStart(2, '0');
  const day = vietnamTime.getDate().toString().padStart(2, '0');
  const month = (vietnamTime.getMonth() + 1).toString().padStart(2, '0');
  const year = vietnamTime.getFullYear();

  // Trả về định dạng "HH:mm DD/MM/YYYY"
  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

export function formatRelativeTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  
  // Chuyển đổi sang múi giờ Việt Nam (UTC+7)
  const vietnamTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
  const vietnamNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));

  const diffInSeconds = Math.floor((vietnamNow.getTime() - vietnamTime.getTime()) / 1000);
  
  // Nếu thời gian đăng < 1 ngày thì hiển thị relative time
  if (diffInSeconds < 60) {
    return 'vừa xong';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} phút trước`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} giờ trước`;
  }
  
  // Nếu > 1 ngày thì hiển thị định dạng đầy đủ
  return formatDate(vietnamTime);
}
