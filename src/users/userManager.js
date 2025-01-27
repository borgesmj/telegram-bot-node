export default class Users{
    constructor(){
        this.userStatus = {}
        this.userProfile = {}
    }

    setUserStatus(chatId, status){
        this.userStatus[chatId] = status
    }

    getUserStatus(chatId){
        return this.userStatus[chatId] || "inicial"
    }

    setUserProfile(chatId, userProfile){
        this.userProfile[chatId] = userProfile
    }

    getUserProfile(chatId){
        return this.userProfile[chatId] 
    }
}