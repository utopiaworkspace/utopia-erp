import * as React from 'react';
import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { Navigate, useLocation } from 'react-router';
import { useSession } from '../SessionContext';
import { doc, getDoc, setDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { TextField, Button, Box } from '@mui/material';

import { db } from '../firebase/firebaseConfig';

export default function MyProfile() {
  const { session, loading } = useSession();
  const location = useLocation();
  const [userData, setUserData] = useState<any>(null);
  const [bankInfo, setBankInfo] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Show a loading indicator while the session is being determined
  if (loading) {
    return <LinearProgress />;
  }

  // Redirect to the sign-in page if the user is not logged in
  if (!session) {
    return <Navigate to="/sign-in" state={{ from: location }} />;
  }

  const { user } = session;

  console.log('User:', user);

  // Fetch user and bank information from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        console.log("Users collection data:", querySnapshot.docs.map(doc => doc.data()));
        console.log("Fetching data for user:", user.email);
        const userRef = doc(db, 'users', user.email);
        const userDoc = await getDoc(userRef);
        console.log("UserDoc exists:", userDoc.exists());
        console.log("UserDoc data:", userDoc.data());

        const bankRef = doc(db, 'bankinfo', user.email);
        const bankDoc = await getDoc(bankRef);
        console.log("BankDoc exists:", bankDoc.exists());
        console.log("BankDoc data:", bankDoc.data());

        setUserData(userDoc.exists() ? userDoc.data() : {});
        setBankInfo(bankDoc.exists() ? bankDoc.data() : {});
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user.email]);

  // Handle input changes for user data
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // Handle input changes for bank info
  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBankInfo({ ...bankInfo, [e.target.name]: e.target.value });
  };

  // Save updated data to Firestore
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (userData) {
        await setDoc(doc(db, 'users', user.email), userData, { merge: true });
      }
      if (bankInfo) {
        await setDoc(doc(db, 'bankinfo', user.email), bankInfo, { merge: true });
      }
  
      // Send to Google Apps Script Web App
      const combinedData = { ...userData, ...bankInfo, email: user.email };
      await fetch("https://script.google.com/macros/s/AKfycbzstx__iM7mG_uOAyG_2KAY2eGplYtFRHcV54Ut4R9VDcltJO4y5SrdR8nv8JmKN3LVhw/exec", {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(combinedData),
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  

  return (
    <div>
      
      <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* User Information */}
        <Typography variant="h6">User Information</Typography>
        <TextField
          label="Full Name"
          name="fullName"
          value={userData?.fullName || ''}
          onChange={handleUserChange}
          fullWidth
        />
        <TextField
          label="Short Name"
          name="shortName"
          value={userData?.shortName || ''}
          onChange={handleUserChange}
          fullWidth
        />
        <TextField
          label="Email"
          name="gmail"
          value={user.email || ''}
          onChange={handleUserChange}
          fullWidth
          disabled // Email is usually not editable
        />
        <TextField
          label="IC"
          name="icNum"
          value={userData?.icNum || ''}
          onChange={handleUserChange}
          fullWidth
        />
        <TextField
          label="Phone Number"
          name="phoneNum"
          value={userData?.phoneNum || ''}
          onChange={handleUserChange}
          fullWidth
        />

        {/* Bank Information */}
        <Typography variant="h6">Bank Information</Typography>
        <TextField
          label="Bank Holder"
          name="bankHolder"
          value={bankInfo?.bankHolder || ''}
          onChange={handleBankChange}
          fullWidth
        />
        <TextField
          label="Bank Name"
          name="bankName"
          value={bankInfo?.bankName || ''}
          onChange={handleBankChange}
          fullWidth
        />
        <TextField
          label="Bank Number"
          name="bankNum"
          value={bankInfo?.bankNum || ''}
          onChange={handleBankChange}
          fullWidth
        />

        {/* Save Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </div>
  );
}
