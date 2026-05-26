// Importing Images
import titleImg from "./assets/genie.svg"
import lampImg from "./assets/lamp.svg"
// Importing React
import React from 'react'
import ReactMarkdown from "react-markdown"
import rehypeSanitize from "rehype-sanitize"
import DOMPurify from "dompurify"
import remarkGfm from "remark-gfm"
// Importing OpenAI
import OpenAI from "openai"
// Importing JS Programs
import { instructions as systemPrompt } from "../instructions.js"
import { checkEnvironment } from "../utils"
import { giftSchemaResponses } from "../schema-responses.js"
// SetUp OpenAI Client
const openai = new OpenAI ({
  apiKey : import.meta.env.VITE_AI_KEY,
  baseURL : import.meta.env.VITE_AI_URL,
  dangerouslyAllowBrowser : true
})

export default function App() {
  // Defining State
  const [loadingState, setLoadingState] = React.useState(false)
  const [inputPrompt, setInputPrompt] = React.useState("")
  const [responseOutput, setResponseOutput] = React.useState("")
  const [messages, setMessages] = React.useState(systemPrompt)
  const [chatHistory, setChatHistory] = React.useState([])
  
  // Checking Environment
  checkEnvironment()

  // CALLING ASYNC AWAIT FUNCTION
  async function setResponseState(e){
    e.preventDefault();
    const userMessage = {
      role: "user",
      content: inputPrompt
    }
    try{
      setLoadingState(true)
      const updatedMessages = [
        ...messages,
        userMessage
      ]
      setMessages(updatedMessages)
      setChatHistory(prev => [
        ...prev,
        userMessage
      ])
      const stream = await openai.responses.create({
        model: import.meta.env.VITE_AI_MODEL,
        input: updatedMessages,
        tools: [{ type: "web_search_preview" }],
        stream: true
      })
      let fullResponse = ""
      setResponseOutput("")
      for await (const chunk of stream) {
        if (chunk.type === "response.output_text.delta") {
          fullResponse += chunk.delta
          setResponseOutput(fullResponse)
        }
      }
      const assistantMessage = {
        role: "assistant",
        content: fullResponse
      }
      setMessages([
        ...updatedMessages,
        assistantMessage
      ])
      setChatHistory(prev => [
        ...prev,
        assistantMessage
      ])
      setResponseOutput("")

    } catch(error){
      if(error.status === 401 || error.status === 403){
        setResponseOutput("Authentication error: Check your AI-KEY and make sure it's Valid");
      } else if(error.status >= 500){
        setResponseOutput("AI provider error: Something went wrong on the provider side. Try again shortly.");
      } else {
        setResponseOutput(`Unexpected error: ${error.message || error}`);
      }

    } finally {
      setLoadingState(false)
      setInputPrompt("")
    }
  }

   return(
    <div className="app-container">
      <div className="app-header">
         <img src={titleImg} alt="logo" />
        <h1 className="app-title">Gift Genie</h1>
      </div>
      <p className="subtitle">
        AI-powered personalized gift recommendations
      </p>
      <textarea
        className="prompt-box"
        disabled={loadingState}
        value={inputPrompt}
        onChange={(e)=>setInputPrompt(e.target.value)}  
        placeholder="Write your prompt here!"></textarea>
      <br />
      <button
          className="submit-btn"
          disabled={loadingState || !inputPrompt.trim()}
          onClick={setResponseState}>
        <img src={lampImg} alt="lamp button image" style={{width: "3rem"}}/>
        <p>{loadingState? "Your call is connected, please wait for response" : "Call AI"}</p>
      </button>
      <div>
        {loadingState && <p>🤖 Thinking...</p>}
        <div className="chat-container">
          {chatHistory.map((msg, index) => (
            <div 
              key={index}
              className={
                msg.role === "user"
                  ? "message user-message"
                  : "message assistant-message"}
              >
              <div className="role-label">
                {msg.role}
              </div>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
              >
                {DOMPurify.sanitize(msg.content)}
              </ReactMarkdown>
            </div>
            ))}
          </div>
          {loadingState && responseOutput && (
            <div className="message assistant-message">
              <div className="role-label">
                assistant
              </div>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
              >
                {DOMPurify.sanitize(responseOutput)}
              </ReactMarkdown>
              <span className="cursor">▋</span>
            </div>
          )}
          {loadingState && <span className="cursor">▋</span>}
      </div>
    </div>
   )
}