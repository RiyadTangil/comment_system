import axios from "axios"
import { useState } from "react"

export default function Login2() {
    const [userName, setUsername] = useState('')
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await axios.post('api/auth/login', { username: "riyadxp2@gmail.com", password: "Ri11559988" })
            console.log("res => ", res)

        } catch (error) {
            console.log("error => ", error.response?.data?.msg )
        }

    }

    return <div>
        <h1>user name {userName}</h1>
        <form onSubmit={handleSubmit}>
            <input type="text" name="userName" placeholder="user name" ></input>
            <button type='submit'>submit</button>
        </form>


    </div>
}
