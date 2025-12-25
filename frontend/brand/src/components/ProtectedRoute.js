import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getToken } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, []);

  if (!authorized) return null;

  return children;
}
