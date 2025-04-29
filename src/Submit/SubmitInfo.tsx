import { ENDPOINTS } from "./endpoints";


export async function upsertUserInfo(userData: any) {
  try {
    userData.action = "upsert_userinfo";
    console.log("Submitting user data:", userData);

    const response = await fetch(
      ENDPOINTS.SUBMIT_USERINFO,
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }
    );

    // ❗Note: since you're using `no-cors`, `response.json()` will fail.
    return { success: true };
  } catch (error) {
    console.error("Error submitting claim:", error);
    throw error;
  }
}
