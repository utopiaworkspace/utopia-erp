import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore"; 
import { db } from "../firebase/firebaseConfig";
// Initialize Firestore

/**
 * Recommended: Generate a unique Claim ID using date and 4-char UUID suffix.
 * Format: CLG-YYMMDD-XXXX or CLB-YYMMDD-XXXX
 * - CLG: General Claim
 * - CLB: Benefit Claim
 * - YYMMDD: today's date
 * - XXXX: last 4 chars of a random UUID
 * Example: CLG-240525-A1F3
 */
export function handleClaimID(claimType: string) {
  const today = new Date();
  const yymmdd = today.toISOString().slice(2, 10).replace(/-/g, "");

  // Generate a random UUID and take the last 4 characters as a unique suffix
  const uuid = crypto.randomUUID();
  const suffix = uuid.slice(-4);

  // Prefix: CLG for General, CLB for Benefit
  const prefix = claimType === 'General' ? 'CLG' : 'CLB';

  // Combine to form the Claim ID (uppercase for readability)
  const claimId = `${prefix}-${yymmdd}-${suffix}`.toUpperCase();
  console.log(`Generated Claim ID: ${claimId}`);

  return claimId;
}

/*
 // (Legacy) Firestore counter version for strictly increasing Claim IDs:
 // Uncomment this function if you want to use Firestore for sequential IDs.
 // This method is slower and requires Firestore write/read for every claim.

export async function handleClaimIDFirestore(claimType: string) {
  const today = new Date();
  const yymmdd = today.toISOString().slice(2, 10).replace(/-/g, "");
  const prefix = claimType === 'General' ? 'CLG' : 'CLB';

  const collectionRef = 'claims';
  const counterDocRef = doc(db, collectionRef, 'counter');
  let claimId = '';

  const counterDocSnapshot = await getDoc(counterDocRef);

  if (counterDocSnapshot.exists()) {
    const currentCounter = counterDocSnapshot.data().counter || 0;
    const newCounter = currentCounter + 1;
    await updateDoc(counterDocRef, { counter: newCounter });
    claimId = `${prefix}-${yymmdd}-${String(newCounter).padStart(4, '0')}`.toUpperCase();
  } else {
    await setDoc(counterDocRef, { counter: 1 });
    claimId = `${prefix}-${yymmdd}-0001`.toUpperCase();
  }

  console.log(`Generated Claim ID (Firestore): ${claimId}`);
  return claimId;
}
*/
