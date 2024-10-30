class User{
    email;
    password;
    authStatus;

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
            }
            return data;
        })
    }
    setEmail(email) {
        this.email = email;
    }
    getEmail(){
        return this.email;
    }
    setPassword(password){
        this.password = password;
    }
    getPassword(){
        return this.password;
    }
    setAuthStatus(authStatus){
        this.authStatus = authStatus;
    }
    getAuthStatus(){
        return this.authStatus;
    }
};

module.exports = User;
