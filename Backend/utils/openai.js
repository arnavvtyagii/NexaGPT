import "dotenv/config";

const getOpenAIAPIResponse = async (message) => {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "My Chat App",
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",

          messages: [
            {
              role: "user",
              content: message,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter error: ${errText}`);
    }

    const data = await response.json();

    return data?.choices?.[0]?.message?.content || "No response";
  } catch (err) {
    console.error("API Error:", err.message);
    return "Something went wrong while fetching response.";
  }
};

export default getOpenAIAPIResponse;

export const transcribeAudio = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", "openai/whisper-1");

  const res = await fetch("https://openrouter.ai/api/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: formData,
  });

  const data = await res.json();
  return data.text;
};

export const textToSpeech = async (text) => {
  const res = await fetch("https://openrouter.ai/api/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini-tts-2025-12-15",
      input: text,
      voice: "alloy",
      response_format: "mp3",
    }),
  });

  const audioBlob = await res.blob();
  return URL.createObjectURL(audioBlob);
};
