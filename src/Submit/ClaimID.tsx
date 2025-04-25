import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore"; 
import { db } from "../firebase/firebaseConfig";
// Initialize Firestore


export async function handleClaimID(claimType: string) {
    const collectionRef = claimType === 'General' ? 'claimsgeneral' : 'claimsbenefit';
    
    // Reference to the document in Firebase
    const counterDocRef = doc(db, collectionRef, 'counter'); // You may have a different logic to identify the document

    try {
        // Get the current document
        const counterDocSnapshot = await getDoc(counterDocRef);

        let claimId: string;

        if (counterDocSnapshot.exists()) {
            // Document exists, increment the counter
            const currentCounter = counterDocSnapshot.data().counter || 0;
            const newCounter = currentCounter + 1;

            // Update counter in the database
            await updateDoc(counterDocRef, {
                counter: newCounter
            });

            // Generate claimId based on the type and counter
            claimId = claimType === 'General' ? `CLG-25${newCounter.toString().padStart(4, '0')}` : `CLB-25${newCounter.toString().padStart(4, '0')}`;

            console.log(`Counter incremented to: ${newCounter}`);
            console.log(`Generated Claim ID: ${claimId}`);
        } else {
            // Document doesn't exist, set counter to 1
            await setDoc(counterDocRef, {
                counter: 1
            });

            // Generate claimId for first entry
            claimId = claimType === 'General' ? 'CLG-250001' : 'CLB-250001';

            console.log("Counter initialized to 1");
            console.log(`Generated Claim ID: ${claimId}`);
        }

        // Return or use the generated claimId
        return claimId;

    } catch (error) {
        console.error("Error updating counter:", error);
        throw error;
    }
}
