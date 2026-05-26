// Importing Images
import titleImg from "./assets/genie.svg"
import lampImg from "./assets/lamp.svg"
// Importing React
import React from 'react'
// Importing OpenAI
import OpenAI from "openai"
// Importing JS Programs
import { instructions as prompt } from "../instructions.js"
import { checkEnvironment } from "../utils"

export default function App() {
  // Defining State
  const [inputPrompt, setInputPrompt] = React.useState()
  const [output, setOutput] = React.useState()
  const [loadingState, setLoadingState] = React.useState(false)
  const [messageArray, setMessageArray] = React.useState([])
  // SetUp OpenAI Client
  const openai = new OpenAI ({
    apiKey : import.meta.env.VITE_AI_KEY,
    baseURL : import.meta.env.VITE_AI_URL,
    dangerouslyAllowBrowser : true
  })
  // Checking Environment
  checkEnvironment()

  // CALLING ASYNC AWAIT FUNCTION
  async function setResponseState(){
    try{
      setLoadingState(true)
      const response = await openai.chat.completions.create({
        model: import.meta.env.VITE_AI_MODEL,
        messages: prompt
      })
      const responseOutput = response.choices[0].message.content
      setInputPrompt(responseOutput)

    } catch(error){
      if(error.status === 401 || error.status === 403){
        setInputPrompt("Authentication error: Check your AI-KEY and make sure it's Valid");
      } else if(error.status >= 500){
        setInputPrompt("AI provider error: Something went wrong on the provider side. Try again shortly.");
      } else {
        setInputPrompt("Unexpected error:" `${error.message || error}`);
      }

    } finally {
      setLoadingState(false)

    }
  }

   return(
    <>
      <div>
        <img
          src={titleImg}
          alt="title-logo"
          style={{
            width: "3rem",
            display: "block",
            backgroundColor:"black",
            margin: "0 auto"
          }}
        />
        <h1>This is genie App</h1>
      </div>
      <p>Click to call AI and ask for suggestion</p>
      <p style={{fontWeight:"bold",
        fontStyle: "italic"
      }}>System Prompt: {prompt[0].content}</p>
      <p style={{fontWeight:"bold",
        fontStyle: "italic"
      }}>Prompt: {prompt[1].content}</p>
      <p style={{fontWeight:"bold",
        fontStyle: "italic"
      }}>Input Prompt: {input}</p>
      <textarea
        style={{
          width:"100%",
          height:"70px",
          resize:"none"
        }}
        onChange={(e)=>setInput(e.target.value)}  
        placeholder="Write your prompt here!"></textarea>
      <br />
      <button 
        style={{width:"100%"}}
        onClick={setResponseState}>
        <img src={lampImg} alt="lamp button image" style={{width: "3rem"}}/>
        <p>Call AI</p>
      </button>
      <div>
        {loadingState && "Making AI Request..."} 
      </div>
    </>
   )
}