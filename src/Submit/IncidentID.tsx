import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/**
 * Generate a unique Incident ID for each incident report.
 *
 * Format: IR-yymmdd-xxxx
 * - yymmdd: today's date (year, month, day)
 * - xxxx: last 4 characters of a random UUID (almost impossible to repeat)
 *
 * Example output: IR-240525-a1f3
 *
 * This method is simple and reduces the chance of two users getting the same ID at the same time.
 *
 * Usage: Call handleIncidentID() whenever you need a new Incident ID.
 */
export function handleIncidentID() {
  const today = new Date();
  // Get date in yymmdd format, e.g. "240525"
  const yymmdd = today.toISOString().slice(2, 10).replace(/-/g, "");

  // Generate a random UUID and take the last 4 characters as a unique suffix
  const uuid = crypto.randomUUID(); // Example: "b7e5e2e2-8e2a-4e7c-9a1f-4a1fa1f3a1f3"
  const suffix = uuid.slice(-4); // Example: "a1f3"

  // Combine to form the Incident ID (convert to uppercase for better readability)
  const incidentId = `IR-${yymmdd}-${suffix}`.toUpperCase();
  console.log(`Generated Incident ID: ${incidentId}`);

  return incidentId;
}
