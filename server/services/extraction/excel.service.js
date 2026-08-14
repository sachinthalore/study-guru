import XLSX from "xlsx";

export const extractExcelText = async (buffer) => {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
  });

  const textParts = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];

    const csvText = XLSX.utils.sheet_to_csv(worksheet);

    if (csvText.trim()) {
      textParts.push(
        `Sheet: ${sheetName}\n${csvText.trim()}`
      );
    }
  }

  return textParts.join("\n\n").trim();
};