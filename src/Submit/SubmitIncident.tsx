import { ENDPOINTS } from "./endpoints";
import { convertFileToBase64 } from "../utils/base64";
import { handleIncidentID } from "./IncidentID"; // We will create this, similar to handleClaimID

export default async function submitIncident(incidentData: any) {
  try {
    incidentData.action = "submit_incident";
    incidentData.source = "Webapp";
    incidentData.createdAt = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');

    // Generate incident ID
    const incidentId = await handleIncidentID();
    incidentData.incidentId = incidentId;

    console.log(incidentData);
    // Convert file to Base64 if uploaded
    if (incidentData.file) {
      const base64 = await convertFileToBase64(incidentData.file);
      incidentData.file = {
        name: incidentData.file.name,
        base64,
      };
    }

    console.log("Submitting incident data:", incidentData);

    const response = await fetch(
      ENDPOINTS.SUBMIT_INCIDENT,
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(incidentData),
      }
    );

    // Note: using no-cors, so response.json() will not work
    return { success: true, incidentId: incidentData.incidentId };
  } catch (error) {
    console.error("Error submitting incident:", error);
    throw error;
  }
}
