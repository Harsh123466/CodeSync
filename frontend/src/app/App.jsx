import "./App.css"
import {Editor} from "@monaco-editor/react"    // we use monaco for code editor
import { MonacoBinding } from "y-monaco"
import * as Y from "yjs"
import { useRef, useMemo, useState, useEffect } from "react"
import { SocketIOProvider } from "y-socket.io"


function App() {

  const editorRef = useRef(null)
  const [ username, setUsername ] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || ""
  })

  const [users, setUsers] = useState([])

  const ydoc = useMemo(() => new Y.Doc(), [])
  const yText = useMemo(() => ydoc.getText('monaco'), [ydoc])

  const handlerMount = (editor) => {
    editorRef.current = editor

    new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
    )
  }

  useEffect(() => {
    // console.log(username, editorRef.current)

    if(username){

      const provider = new SocketIOProvider("http://localhost:3000", "monaco", ydoc,{
        autoConnect: true
      })

      provider.awareness.setLocalStateField("user", {username})

      provider.awareness.on("change", () => {
        const states = Array.from(provider.awareness.getStates().values())
        setUsers(states.filter(state => state.user && state.user.username).map(state => state.user))
      })

      function handleBeforUnload() {
        provider.awareness.setLocalStateField("user", null)
      }

      window.addEventListener("beforeunload", handleBeforUnload)


      return () => {
        provider.disconnect()
        window.removeEventListener("beforeunload", handleBeforUnload)
      }
    }
  },[
    username
  ])

  const handleJoin = (e) => {
    e.preventDefault()
    setUsername(e.target.username.value)
    window.history.pushState({}, "", "?username=" + e.target.username.value)
  }
  if(!username){
    return (
      <main className="h-screen w-full bg-gray-950 flex gap p-4 items-center justify-center">
        <form
        onSubmit={handleJoin}
         className="flex flex-col gap-4">
          <input 
            type="text"
            placeholder="Enter your username"
            className="p-2 rounded-lg bg-gray-800 text-white"
            name="username"
            />
            <button className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold cursor-pointer">
              join
            </button>
        </form>

      </main>
    )
  }

  return (
    <main className="h-screen w-ful bg-gray-950 flex gap-4 p-5">
      <aside className="h-full w-1/4 bg-amber-50 rounded-lg">
        <h2 className="text-2xl font-bold p-4 border-b border-gray-300">Users</h2>
        <ul className="p-4">
          {users.map((user, index) => (
            <li key={index} className="p-2 bg-gray-800 text-white rounded mb-2">
              {user.username}
            </li>
          ))}
        </ul>
      </aside>
      <section className="w-3/4 bg-neutral-800 rounded-lg">
        <Editor 
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// some comment"
          theme="vs-dark"
          onMount={handlerMount}
        />
      </section>
    </main>
  )
}

export default App