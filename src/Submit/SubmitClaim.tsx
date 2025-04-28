import { handleClaimID } from "./ClaimID";
import { ENDPOINTS } from "./endpoints";
import { convertFileToBase64 } from "../utils/base64";

export async function submitClaim(claimData: any) {
  try {
    claimData.action = "submit_claim";

    // Generate claim ID
    const claimId = await handleClaimID(claimData.claimType);
    claimData.claimId = claimId;
   

    const receiptPrefix = claimData.claimType === 'General' ? 'RCG' : 'RCB';

    // Convert each receipt file to base64 and add receipt ID
    const receiptsWithBase64 = await Promise.all(
      claimData.receipts.map(async (receipt: any, index: number) => {
        const base64 = await convertFileToBase64(receipt.file);
        const receiptNumber = (index + 1).toString().padStart(2, '0'); // 01, 02, 03, etc.

        return {
          receiptId: `${receiptPrefix}-${claimId.slice(-6)}-${receiptNumber}`, // e.g., RCG-250001-001
          receiptDate: receipt.date,
          description: receipt.description,
          amount: receipt.amount,
          remarks: receipt.remarks || "",
          file: {
            name: receipt.file.name,
            base64,
          },
        };
      })
    );

    claimData.receipts = receiptsWithBase64;

    console.log("Submitting claim data:", claimData);

    const response = await fetch(
      ENDPOINTS.SUBMIT_CLAIM,
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(claimData),
      }
    );

    //Note: since you're using `no-cors`, `response.json()` will fail. since using browser, cannot retrieve response body.
    return { success: true, claimId: claimData.claimId };
  } catch (error) {
    console.error("Error submitting claim:", error);
    throw error;
  }
}
