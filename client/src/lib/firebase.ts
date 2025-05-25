// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Không nên import analytics ở môi trường SSR

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAsQQNZyjY4PKfvbeNS_R3pAKyqebOUvYI",
  authDomain: "solace-e5b93.firebaseapp.com",
  projectId: "solace-e5b93",
  storageBucket: "solace-e5b93.appspot.com",
  messagingSenderId: "981511514895",
  appId: "1:981511514895:web:a4fd2f2e5110b2c609ac7a",
  measurementId: "G-XDF25MBMYM"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
// Analytics chỉ nên khởi tạo ở browser nếu cần:
// if (typeof window !== 'undefined') {
//   const analytics = getAnalytics(app);
// }

export { app, auth };