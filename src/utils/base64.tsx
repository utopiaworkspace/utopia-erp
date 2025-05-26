export async function convertFileToBase64(file: File): Promise<string> {
  // Export an async function that takes a File and returns a string (base64)
  return new Promise((resolve, reject) => {
    // Return a Promise for async file reading
    const reader = new FileReader();
    // Create a FileReader to read the file
    reader.onloadend = () => resolve(reader.result as string);
    // When reading is done, resolve the Promise with the result (as a string)
    reader.onerror = reject;
    // If there is an error, reject the Promise
    reader.readAsDataURL(file);
    // Start reading the file as a base64 data URL
  });
}