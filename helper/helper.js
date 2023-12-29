exports.validateEmail = (email) =>{
    const emailRej = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    if (!email.match(emailRej)) {
        return false
    } else {
        return true
    }
}

exports.validatePassword = (password) =>{
    const passwordRej = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
    if (!password.match(passwordRej)) {
        return false
    } else {
        return true
    }
}

exports.validateMobile = (mobile) => {
    const mobileRej =  /^[0]?[6789]\d{9}$/
    if(!mobile.match(mobileRej)) {
        return false
    } else {
        return true
    }
}