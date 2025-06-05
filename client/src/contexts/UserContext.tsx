"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

interface UserContextType {
  user: UserData | null;
  accessToken: string | null;
  loading: boolean;
  setUserData: (user: UserData, token: string) => void;
  signup: (email: string, password: string, firstName: string, lastName: string) => void;
  login: (email: string, password: string) => void;
  logout: (reason?: string) => Promise<void>;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  accessToken: null,
  loading: true,
  setUserData: () => {},
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

export function UserContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Hàm để lấy thông tin người dùng từ server
  const fetchUser = async (token: string) => {
    try {
      const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userRes.ok) {
        throw new Error('Không thể xác minh tài khoản.');
      }

      const userData = await userRes.json();
      setUser(userData.user);
    } catch (err) {
      console.error("Lỗi khi fetch thông tin người dùng:", err);
    }
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        await logout("Phiên đăng nhập đã hết, vui lòng đăng nhập lại.");
        return false;
      }

      const data = await res.json();
      setAccessToken(data.accessToken);
      sessionStorage.setItem("accessToken", data.accessToken);
      
      // Sau khi refresh token, fetch lại thông tin người dùng
      await fetchUser(data.accessToken); 
      return true;
    } catch (err) {
      console.error("Lỗi khi refreshAccessToken:", err);
      await logout("Lỗi khi làm mới phiên. Vui lòng đăng nhập lại.");
      return false;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      let storedToken = sessionStorage.getItem("accessToken");
      if (storedToken) {
        try {
          const decoded: { exp: number } = jwtDecode(storedToken);
          const now = Date.now() / 1000;
          if (decoded.exp > now) {
            setAccessToken(storedToken);
            // KHI CÓ TOKEN HỢP LỆ, LẤY THÔNG TIN USER NGAY LẬP TỨC
            await fetchUser(storedToken); 
          } else {
            // Token hết hạn, thử refresh
            console.log("AccessToken hết hạn, đang thử làm mới...");
            await refreshAccessToken();
          }
        } catch (err) {
          console.warn("AccessToken không hợp lệ trong sessionStorage, đang thử làm mới hoặc yêu cầu đăng nhập.");
          await refreshAccessToken(); // Hoặc đơn giản là logout nếu bạn không muốn auto-refresh
        }
      }
      setLoading(false); // Đặt loading thành false sau khi hoàn tất kiểm tra và fetch
    };

    initialize();
  }, []); // Chỉ chạy một lần khi component mount

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
      }

      const data = await res.json();
      setUserData(data.user, data.accessToken);
      return;
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      throw error;
    }
  };
  
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json(); 
        throw new Error(errorData.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
      }

      const data = await res.json();
      setUserData(data.user, data.accessToken);
      return;
    } catch (error: any) {
      console.error("Lỗi khi đăng nhập:", error);
      throw error; 
    }
  };

  const setUserData = (userData: UserData, token: string) => {
    setUser(userData);
    setAccessToken(token);
    sessionStorage.setItem("accessToken", token);
  };

  const logout = async (reason?: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error("Lỗi khi logout:", error);
    }
    setUser(null);
    setAccessToken(null);
    sessionStorage.removeItem("accessToken");

    if (reason) {
      alert(reason); // Hoặc thay bằng modal
    }

    router.push('/');
  };

  return (
    <UserContext.Provider value={{ user, accessToken, loading, setUserData, signup, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);