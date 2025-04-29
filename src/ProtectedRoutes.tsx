import React, { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Stop loading once auth state is determined
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while auth state is being determined
  }

  return user ? <>{children}</> : <Navigate to="/" />;
};

export default ProtectedRoute;