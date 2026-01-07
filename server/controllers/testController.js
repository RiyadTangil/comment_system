import * as authService from '../services/testService.js'
export const reg = async (req, res) => {
    try {
        const { username, password } = req.body
        const reguser = await authService.reg(username, password)
        res.json(reguser)
    } catch (error) {

    }
}