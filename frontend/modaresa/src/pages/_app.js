import "@/styles/globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getToken } from "../utils/auth";

const publicRoutes = ["/login", "/register"];

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const isPublic = publicRoutes.includes(router.pathname);

    if (!token && !isPublic) {
      router.replace("/login");
      return;
    }

    if (token && isPublic) {
      router.replace("/dashboard");
      return;
    }

    setLoading(false);
  }, [router.pathname]);

  if (loading) return null; // no flicker, no blank bug

  return <Component {...pageProps} />;
}
