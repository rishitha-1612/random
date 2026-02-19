export async function analyzeCSV(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://127.0.0.1:8023/analyze", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Analysis failed");
  }

  return response.json();
}
