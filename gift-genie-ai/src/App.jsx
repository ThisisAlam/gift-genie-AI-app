import OpenAI from "openai"

export default function App() {

  console.log(import.meta.env.VITE_AI_MODEL)
  
  function checkEnvironment() {
    if (!import.meta.env.VITE_AI_URL) {
      throw new Error("Missing AI_URL. This tells us which AI provider you're using.");
    }

    if (!import.meta.env.VITE_AI_MODEL) {
      throw new Error("Missing AI_MODEL. The AI request needs a model name.");
    }

    if (!import.meta.env.VITE_AI_KEY) {
      throw new Error("Missing AI_KEY. Your API key is not being picked up.");
    }

    console.log("AI provider URL:", import.meta.env.VITE_AI_URL);
    console.log("AI model:", import.meta.env.VITE_AI_MODEL);
    console.log("Environment variables loaded successfully")
  }

async function runAIRequest() {

    checkEnvironment()

      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_AI_KEY,
        baseURL: import.meta.env.VITE_AI_URL,
        dangerouslyAllowBrowser: true
      })

  const prompt =
      "Suggest me some gift ideas for my wife who loves gardening"

  console.log("Prompt:", prompt);

  console.log("Making AI request...");

  try {

      const response = await openai.chat.completions.create({
          model: import.meta.env.VITE_AI_MODEL,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        })

      console.log("AI response:")

      console.log(response.choices[0].message.content)

  } catch (error) {
      
    if (error.status === 401 || error.status === 403) {
        console.error(
          "Authentication error: Check your AI_KEY and make sure it's valid."
        );
      
    } else if (error.status >= 500) {
        console.error(
          "AI provider error: Something went wrong on the provider side. Try again shortly."
        );
    } else {
        console.error(
          "Unexpected error:",
          error.message || error
        );
    }
  }
}

  
 return (
    <div>
      <h1>Gift Genie AI</h1>

      <button onClick={runAIRequest}>
        Generate Gifts
      </button>
    </div>
  )
}