import OpenAI from "openai"
import { checkEnvironment } from "../utils.js"

export default function App() {

  console.log(import.meta.env.VITE_AI_MODEL)  

  async function runAIRequest() {

    checkEnvironment()
    
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_AI_KEY,
      baseURL: import.meta.env.VITE_AI_URL,
      dangerouslyAllowBrowser: true
    })
    
    const prompt =
      "Suggest me some gift ideas for my wife who loves gardening"
    
      const prompt2 = `  
      Suggest some gifts for someone who loves hiphop music. 
      Make these suggestions thoughtful and practical. 
      Your response must be under 100 words. 
      Skip intros and conclusions. 
      Only output gift suggestions.
    `

    console.log("Prompt:", prompt2);
    console.log("Making AI request...");
    
    try {
      const response = await openai.chat.completions.create({
        model: import.meta.env.VITE_AI_MODEL,
        messages: [
          {
            role: "user",
            content: prompt2,
          },
        ],
      })
      console.log("AI response:")
      console.log(response.choices[0].message.content)
    } 
    catch (error) {    
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