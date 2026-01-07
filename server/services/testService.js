import { genSalt, hash } from "bcryptjs"
import User from "../models/User"

export const reg = async (usrname, password) => {
    if (!usrname, !password) {
        const error = new Error("pleae enter all filds")
        error.statusCode = 400
        throw error
    }
    let user = await User.findOne({ username: usrname })
    if (user) {
        const error = new Error("user already exists")
        error.statusCode = 400
        throw error
    }
    const slt = genSalt(10)
    const hasedPass = await hash(password, slt)
    user = new User(usrname, password)
    await user.save()

}