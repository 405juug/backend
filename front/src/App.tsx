import { useState } from 'react'
import './App.css'

function App() {
    const [userLogin, setUserLogin] = useState("")
    const [userPassword, setUserPassword] = useState("")

    const submit = async(e) => {
        e.preventDefault()
        const result = await fetch("http://localhost:3000/api/auth/register", {
            method: "POST",
            body: JSON.stringify({
                email: userLogin,
                password: userPassword,
            }),
            headers: {
                "Content-Type": "application/json",
            }
        })
        console.log(result)
    }

      return (
        <>
          <form onSubmit={submit}>
              <input type="text" onChange={(e) => setUserLogin(e.target.value)} value={userLogin} />
              <input type="password" onChange={e => setUserPassword(e.target.value)} value={userPassword} />
              <input type="submit" value="Login"  />
          </form>
        </>
      )
}

export default App
