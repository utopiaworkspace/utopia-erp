import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export async function handleIncidentID() {
  const collectionRef = 'incidents'; // All incident tickets stored under 'incidents' collection
  const counterDocRef = doc(db, collectionRef, 'counter');

  try {
    // Get the current document
    const counterDocSnapshot = await getDoc(counterDocRef);

    let incidentId: string;

    if (counterDocSnapshot.exists()) {
      // Document exists, increment the counter
      const currentCounter = counterDocSnapshot.data().counter || 0;
      const newCounter = currentCounter + 1;

      // Update counter in Firestore
      await updateDoc(counterDocRef, {
        counter: newCounter,
      });

      // Format incident ID
      incidentId = `IR-1${newCounter.toString().padStart(3, '0')}`;

      console.log(`Counter incremented to: ${newCounter}`);
      console.log(`Generated Incident ID: ${incidentId}`);
    } else {
      // If counter document doesn't exist, create it
      await setDoc(counterDocRef, {
        counter: 1,
      });

      incidentId = 'IR-250001';
      console.log("Counter initialized to 1");
      console.log(`Generated Incident ID: ${incidentId}`);
    }

    return incidentId;
  } catch (error) {
    console.error("Error updating incident counter:", error);
    throw error;
  }
}
