export default class Users {
  constructor() {
    this.userStatus = {};
    this.userProfile = {};
    this.userAmmount = {};
    this.userTransaction = {};
    this.newUser = {};
    this.editProfile = {};
  }

  setUserStatus(chatId, status) {
    this.userStatus[chatId] = status;
  }

  getUserStatus(chatId) {
    return this.userStatus[chatId] || "inicial";
  }

  setUserProfile(chatId, userProfile) {
    this.userProfile[chatId] = userProfile;
  }

  getUserProfile(chatId) {
    return this.userProfile[chatId];
  }

  setUserAmmount(chatId, ammount) {
    this.userAmmount[chatId] = ammount;
  }

  getUserAmmount(chatId) {
    return this.userAmmount[chatId];
  }

  setUserTransaction(chatId, details) {
    this.userTransaction[chatId] = details;
  }

  getUserTransaction(chatId) {
    return this.userTransaction[chatId];
  }

  setNewUser(chatId, newUser) {
    this.newUser[chatId] = newUser;
  }

  getNewUser(chatId) {
    return this.newUser[chatId];
  }

  setEditProfile(chatId, editProfile) {
    this.editProfile[chatId] = editProfile;
  }

  getEditProfile(chatId){
    return this.editProfile[chatId];
  }
}
