export function changeName(userProfile, msg) {
  userProfile.first_name = msg.text;
  return userProfile
}

export function changeUserEmail(userProfile, msg){
    userProfile.email = msg.text;
    return userProfile
}