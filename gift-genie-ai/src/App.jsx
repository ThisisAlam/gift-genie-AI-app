import titleImg from "./assets/genie.svg"
import lampImg from "./assets/lamp.svg"
import React from 'react'
import OpenAI from "openai"
import { autoResizeTextarea, checkEnvironment, setLoading } from "../utils.js";

export default function App() {

  console.log(import.meta.env.VITE_AI_MODEL)
  
  // Get UI elements
  const giftForm = document.getElementById("gift-form");
  const userInput = document.getElementById("user-input");
  const outputContent = document.getElementById("output-content");
  
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_AI_KEY,
    baseURL: import.meta.env.VITE_AI_URL,
    dangerouslyAllowBrowser: true
  })

  // Onclick Handler for lamp button - runs the AI request
  async function MakeGiftRequest(e) {
    // Prevent default form submission
    e.preventDefault();
    
    checkEnvironment()

    const [answer, setAnswer] = useState("")

    // Setup UI event listeners
    userInput.addEventListener("input", () => 
      autoResizeTextarea(userInput));
    giftForm.addEventListener("submit", MakeGiftRequest);
    
    // Initialize messages array with system prompt
    const messages = [
      {
        role: "system",
        content: `You are the Gift Genie!
        Make your gift suggestions thoughtful and practical.
        Your response must be under 100 words. 
        Skip intros and conclusions. 
        Only output gift suggestions.`,
      },
    ];
    const userPrompt = userInput.value.trim();

    // Get user input, trim whitespace, exit if empty
    if (!userPrompt) return;

    console.log("system:", messages[0].content);
    console.log("user:", userPrompt);
    console.log("Making AI request...");

    if (userPrompt) {
      try {

        // Set loading state
        setLoading(true);

        messages.push({ 
          role: "user",
          content: userPrompt
        })

        const response = await openai.chat.completions.create({
          model: import.meta.env.VITE_AI_MODEL,
          messages
        })
        
        console.log("AI response:")
        console.log(response.choices[0].message.content)
        
        const giftSuggestions = response.choices[0].message.content
        setAnswer(giftSuggestions)

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
      } finally {
        // Clear loading state
        setLoading(false)
      }
    }
  }


  return (
    <div className="app-container">
      <header className="app-header">
        <div className="title-group">
          <img src={titleImg} alt="Genie" className="genie-icon-img" />
          <h1>Gift Genie</h1>
        </div>
      </header>

      <main className="main-content">
        <form id="gift-form" className="gift-form">
          
          <div className="input-section">
            <div className="input-wrapper">
              <textarea id="user-input"
                placeholder="e.g., My friend who loves hiphop music has a birthday coming up in 3 days. 40-60 bucks budget. I live in..."
              ></textarea>
            </div>
          </div>

          <div className="lamp-container">
            <button
              type="submit"
              id="lamp-button"
              className="lamp-btn"
              aria-label="Rub the Lamp"
              onClick={MakeGiftRequest}>
              <span className="lamp-icon">
                <img
                  src={lampImg}
                  alt="Magic Lamp"
                  className="lamp-icon-img"
              /></span>
              <span className="lamp-text">Rub the Lamp</span>
            </button>
          </div>

        </form>

        <section className="output-section">
          <div id="output-container" className="hidden">
            <div id="output-content">
              <p>{answer}</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}