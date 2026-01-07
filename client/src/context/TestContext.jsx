import axios from "axios";
import { createContext, useContext } from "react";

const TestContexxt = createContext()
export const useTestContext = useContext(TestContexxt)
export const TestProvider = ({ children }) => {
    const [loading, setLoading] = useState(falses)
    const [user, setUser] = useState({})
    const login = async (username, password) => {
        const res = await axios.post('/api/auth/login', { username, password })
        const { token, user } = res.data
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token)
        setUser(user)
        return res.data
    }

    return <TestContexxt.Provider value={{ user, login, loading }}>
        {!loading && children}
    </TestContexxt.Provider>
}