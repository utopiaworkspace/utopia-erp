import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const HomePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h1>Home Page</h1>
      {user ? (
        <div>
          <p>Welcome, {user.displayName}</p>
          <p>Email: {user.email}</p>
        </div>
      ) : (
        <p>Loading user information...</p>
      )}
    </div>
  );
};

export default HomePage;    