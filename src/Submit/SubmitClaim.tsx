import { handleClaimID } from "./ClaimID";
import { convertFileToBase64 } from "../utils/base64";
import { supabase } from '../supabase/supabaseClient';

export async function submitClaim(claimData: any) {
  try {
    console.log("📦 claimData received:", claimData);

    // ✅ Ensure the user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("❌ Error getting user:", userError.message);
      throw new Error("🚫 Unable to authenticate user");
    }
    if (!user) {
      throw new Error("🚫 User not authenticated — did you sign in?");
    }

    const userId = user.id;

    // ✅ 1) Generate claim ID
    const claimId = await handleClaimID(claimData.claimType);
    claimData.claimId = claimId;

    // ✅ 2) Select tables/prefix
    const isGeneral = claimData.claimType === "General";
    const masterTable  = isGeneral ? "claim_general_master"  : "claim_benefit_master";
    const detailsTable = isGeneral ? "claim_general_details" : "claim_benefit_details";
    const receiptPrefix = isGeneral ? "RCG" : "RCB";

    // ✅ 3) Prepare receipts
    const receipts = await Promise.all(
      claimData.receipts.map(async (receipt: any, index: number) => {
        if (!Array.isArray(receipt.files) || receipt.files.length === 0) {
          throw new Error(`Receipt at index ${index} has no attached files`);
        }
        const file = receipt.files[0];
        if (!(file instanceof Blob)) {
          throw new Error(`Invalid file object at index ${index}`);
        }
        const base64 = await convertFileToBase64(file);
        const cleanClaimId = claimId.replace(/^CL[GB]-/, "");
        const receiptNumber = (index + 1).toString().padStart(2, "0");

        return {
          receipt_id: `${receiptPrefix}-${cleanClaimId}-${receiptNumber}`,
          claim_id: claimId,
          receipt_date: receipt.date,
          description: receipt.description,
          amount: Number(receipt.amount),
          remarks: receipt.remarks || "",
          file_name: file.name,
          user_id: userId, // ✅ RLS
          // if you later store file blobs/urls, add them here
          // file_base64: base64,
        };
      })
    );

    // ✅ 4) Prepare master row
    // NOTE: we include best-effort contact fields here so the trigger
    // has a fallback if the profiles lookup can't find anything.
    const transformedClaim = {
      claim_id: claimId,
      claim_type: claimData.claimType,
      total_amount: Number(claimData.totalAmount),
      user_id: userId,                          // ✅ important
      email: claimData.email ?? user.email,     // ✅ fallback email
      phone_number: claimData.phoneNumber ?? null, // ✅ fallback phone
      // You can add more fields if you track them in the master:
      // unit: claimData.unit ?? null,
      // full_name: claimData.fullName ?? null,
    };

    // ✅ 5) Insert master
    const { error: masterError } = await supabase
      .from(masterTable)
      .insert([transformedClaim]);

    if (masterError) {
      console.error("❌ Master insert error:", masterError);
      throw new Error("❌ Failed to insert claim: " + masterError.message);
    }

    // ✅ 6) Insert details
    const { error: detailsError } = await supabase
      .from(detailsTable)
      .insert(receipts);

    if (detailsError) {
      console.error("❌ Details insert error:", detailsError);
      throw new Error("❌ Failed to insert receipts: " + detailsError.message);
    }

    console.log("✅ Claim successfully submitted:", claimId);
    return { success: true, claimId };

  } catch (error: any) {
    console.error("🚨 submitClaim error:", error.message || error);
    throw error;
  }
}








// import { handleClaimID } from "./ClaimID";
// import { ENDPOINTS } from "./endpoints";
// import { convertFileToBase64 } from "../utils/base64";
// import { supabase } from '../supabase/supabaseClient';

// export async function submitClaim(claimData: any) {
//   try {
//     claimData.action = "submit_claim";

//     // Generate claim ID
//     const claimId = await handleClaimID(claimData.claimType);
//     claimData.claimId = claimId;
   
//     // 1️⃣ Set receipt prefix based on claim type
//     // If it's General claim → use 'RCG', if Benefit claim → use 'RCB'
//     const receiptPrefix = claimData.claimType === 'General' ? 'RCG' : 'RCB';

//     // 2️⃣ Process all uploaded receipts
//     const receiptsWithBase64 = await Promise.all(
//       claimData.receipts.map(async (receipt: any, index: number) => {
//         // Convert the file to base64 format (for upload)
//         const base64 = await convertFileToBase64(receipt.file);
        
//          // Make 2-digit receipt number: 1 → 01, 2 → 02
//         const receiptNumber = (index + 1).toString().padStart(2, '0');

//          // Remove 'CLG-' or 'CLB-' from claim ID → leave only date + code
//         const cleanClaimId = claimId.replace(/^CL[GB]-/, '');

//         return {
//           // Example: RCG-250531-8F4A-01
//           receiptId: `${receiptPrefix}-${cleanClaimId}-${receiptNumber}`,

//           receiptDate: receipt.date,
//           description: receipt.description,
//           amount: receipt.amount,
//           remarks: receipt.remarks || "",
//           file: {
//             name: receipt.file.name,
//             base64,
//           },
//         };
//       })
//     );


//     claimData.receipts = receiptsWithBase64;
//     claimData.totalAmount = Number(claimData.totalAmount);

//     console.log("Submitting claim data:", claimData);

//     const response = await fetch(
//       ENDPOINTS.SUBMIT_CLAIM,
//       {
//         method: "POST",
//         mode: "no-cors",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(claimData),
//       }
//     );

//     //Note: since you're using `no-cors`, `response.json()` will fail. since using browser, cannot retrieve response body.
//     return { success: true, claimId: claimData.claimId };
//   } catch (error) {
//     console.error("Error submitting claim:", error);
//     throw error;
//   }
// }

