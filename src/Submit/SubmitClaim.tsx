import { handleClaimID } from "./ClaimID";
import { ENDPOINTS } from "./endpoints";
import { convertFileToBase64 } from "../utils/base64";

export async function submitClaim(claimData: any) {
  try {
    claimData.action = "submit_claim";

    // Generate claim ID
    const claimId = await handleClaimID(claimData.claimType);
    claimData.claimId = claimId;
   
    // 1️⃣ Set receipt prefix based on claim type
    // If it's General claim → use 'RCG', if Benefit claim → use 'RCB'
    const receiptPrefix = claimData.claimType === 'General' ? 'RCG' : 'RCB';

    // 2️⃣ Process all uploaded receipts
    const receiptsWithBase64 = await Promise.all(
      claimData.receipts.map(async (receipt: any, index: number) => {
        // Convert the file to base64 format (for upload)
        const base64 = await convertFileToBase64(receipt.file);
        
         // Make 2-digit receipt number: 1 → 01, 2 → 02
        const receiptNumber = (index + 1).toString().padStart(2, '0');

         // Remove 'CLG-' or 'CLB-' from claim ID → leave only date + code
        const cleanClaimId = claimId.replace(/^CL[GB]-/, '');

        return {
          // Example: RCG-250531-8F4A-01
          receiptId: `${receiptPrefix}-${cleanClaimId}-${receiptNumber}`,

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
    claimData.totalAmount = Number(claimData.totalAmount);

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
