import axios from 'axios'
import { ENV } from '../config'

const togglAxios = axios.create({
    baseURL: 'https://api.track.toggl.com/',
    auth: {
        username: ENV.token,
        password: ENV.password
    }
})

export default togglAxios
