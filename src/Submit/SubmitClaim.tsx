import { handleClaimID } from "./ClaimID";

async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function submitClaim(claimData: any) {
  try {
    claimData.action = "upsert_claim";

    // 🔁 Generate claim ID
    const claimId = await handleClaimID(claimData.claimType);
    claimData.claimId = claimId;

    // 🔁 Convert each receipt file to base64
    const receiptsWithBase64 = await Promise.all(
      claimData.receipts.map(async (receipt: any) => {
        const base64 = await convertFileToBase64(receipt.file);
        return {
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
      "https://script.google.com/macros/s/AKfycbwHAhJ4Pz_LeRdRaONT_GhcDLmZYaga9k8Pu29EBKqquCwJ2slgaECCUbkFVHsJcozCAA/exec",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(claimData),
      }
    );

    // ❗Note: since you're using `no-cors`, `response.json()` will fail.
    // You may need to switch to `cors` mode if possible on your Apps Script side.
    const result = {}; // Fake result since no-cors gives empty response

    // If switching to CORS is an option, uncomment this:
    // const result = await response.json();
    // if (result.status !== "success") {
    //   throw new Error(result.message || "Failed to submit claim");
    // }

    return result;
  } catch (error) {
    console.error("Error submitting claim:", error);
    throw error;
  }
}
