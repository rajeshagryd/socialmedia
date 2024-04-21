const axios = require('axios')
const MY_TOKEN = '6968905012:AAFQZB4BdKsIoHS9JjlNEW4ZKRTe42U-1dM'

const BASE_URL = `https://api.telegram.org/bot${MY_TOKEN}`;

function getAxiosInstance() {
    return {
        get(method, param){
            return axios.get(`/${method}`, {
                baseURL: BASE_URL, 
                params: param
            });
        },
        post(method, param){
            return axios.get(`/${method}`, {
                method: 'post',
                baseURL: BASE_URL, 
                url: `/${method}`,
                data
            });
        }
    }
}

module.exports = {axiosInstance: getAxiosInstance()};