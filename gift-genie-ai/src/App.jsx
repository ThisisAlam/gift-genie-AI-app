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
  
  // Checking Environment
  React.useEffect(() => {
    checkEnvironment()
  }, [])
  
  // CALLING ASYNC AWAIT FUNCTION
  async function setResponseState(e){
    e.preventDefault();
    try{
      const userMessage = {
        role: "user",
        content: inputPrompt
      }
      setLoadingState(true)
       const updatedMessages = [
          ...messages,
          userMessage
        ]

      setMessages(prev => [
        ...prev,
        userMessage
      ])
      setMessages(updatedMessages)
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
      setMessages(prev => [
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
  const bottomRef = React.useRef(null)
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    })
  }, [messages, responseOutput])
  
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
        <p>{loadingState? "Your call is connected, please wait for response" : "Call AI"}</p>
      </button>
      <div className="ai-response-section">
        <hr />
        <div className="chat-container">
          {messages
            .filter(msg=>msg.role !== "system")
            .map((msg, index) => (
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
          <div ref={bottomRef}></div>
        </div>
        {loadingState && <span className="cursor">▋</span>}
        <br />
      </div>
    </div>
   )
}