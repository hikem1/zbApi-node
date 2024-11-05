class User{
    email = "";
    password = "";
    authStatus = false;
    message = "";

    async login(email, password){
        const url = 'https://www.zonebourse.com/async/login';
        const options = {method: 'POST'};
        const formData = new FormData();
        formData.append('login', email);
        formData.append('password', password);
        formData.append('remember', 'on');
        options.body = formData;
        
        return fetch(url, options)
        .then(data => data.json())
        .then(data => {
            if(!data.error){
                this.setEmail(email);
                this.setPassword(password);
                this.setAuthStatus(!data.error);
                this.setMessage(data.message);
                return this;
            }else{
                return error = {
                    code: 400,
                    message: data.message
                };
            }
        })
    }
    publicUser(){
        return {
            "email": this.getEmail(),
            "authStatus": this.getAuthStatus(),
            "message": this.getMessage()
        }
    }
    setEmail(email) {
        this.email = email
        return this;
    }
    getEmail(){
        return this.email;
    }
    setPassword(password){
        this.password = password;
        return this;
    }
    getPassword(){
        return this.password;
    }
    setAuthStatus(authStatus){
        this.authStatus = authStatus;
        return this;
    }
    getAuthStatus(){
        return this.authStatus;
    }
    setMessage(message){
        this.message = message;
        return this;
    }
    getMessage(){
        return this.message;
    }
};

module.exports = User;
