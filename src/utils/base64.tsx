// Function to convert a File to Base64
export const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  // Function to convert all receipts to Base64 format
  export const convertReceiptsToBase64 = async (receipts: any[]): Promise<any[]> => {
    const updatedReceipts = await Promise.all(
      receipts.map(async (receipt) => {
        if (receipt.file) {
          const base64File = await convertFileToBase64(receipt.file);
          return {
            ...receipt,
            file: {
              name: receipt.file.name,
              base64: base64File,  // Adding Base64 encoded file
            },
          };
        }
        return receipt;  // Return receipt without modification if no file
      })
    );
    return updatedReceipts;
  };
  