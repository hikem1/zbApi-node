const User = require('./User.js')

class ScrappingService{
    baseUrl = 'https://www.zonebourse.com';
    puppeteer = require('puppeteer');
    User;
    browser;
    page;

    constructor(){
        this.User = new User();
    }
    async start(){
        this.browser = await this.puppeteer.launch({headless: false});
        this.page = await this.browser.newPage();
    }
    async close(){
        this.browser.close();
    }
    async getPublicGraphLink(id, link) {
        const url = this.baseUrl + link + "graphiques/"
        await this.page.goto(url);
        const iframSelector = await this.page.waitForSelector('#prt_dynamic_chart_' + id);
        return await iframSelector?.evaluate(el => el.getAttribute("src"));
    };
    async getSearchResult(keyword){
        const url = this.baseUrl + "/recherche/instruments?q=" + keyword + "&vue=company";
        await this.page.goto(url);
        const data = await this.page.evaluate(() => {
            const tds = Array.from(document.querySelectorAll('#advanced-search__instruments tbody tr'))
            return tds.map(tr => {
               let id = tr.querySelectorAll('a')[1].getAttribute('data-code');
               let name = tr.querySelectorAll('a')[0].innerText;
               let code = tr.querySelectorAll('td')[2].innerText;
               let link = tr.querySelectorAll('a')[0].getAttribute('href');
               let exchangePlace = tr.querySelectorAll('td')[3].querySelector('p').innerText;
               return {
                "id": id,
                "name": name.replace(/<a [^>]+>[^<]*<\/a>/g, '').trim(),
                "code": code.replace(/<a [^>]+>[^<]*<\/a>/g, '').trim(),
                "link": link.replace(/<a [^>]+>[^<]*<\/a>/g, '').trim(),
                "exchange_place": exchangePlace.replace(/<a [^>]+>[^<]*<\/a>/g, '').trim()
                };
            });
        });
        await this.browser.close();
        return data;
    }
    async getPrivateGraphLink(id, link){
        const url = this.baseUrl + link + "graphiques/"
        const email = this.User.getEmail()
        const password = this.User.getPassword()
        // log to page
        await this.page.goto(url);
        await this.page.evaluate((email, password)=>{
            const emailIpt = document.querySelector('input[name="login"]')
            const passIpt = document.querySelector('input[name="password"]')
            const submitBtn = document.querySelector('#loginForm button')
            emailIpt.setAttribute("value", email)
            passIpt.setAttribute("value", password)
            submitBtn.click()
        }, email, password)
        // loggin done -> return src iframe
        await this.page.waitForSelector('#dropdownLoged');
        const iframSelector = await this.page.waitForSelector('#prt_dynamic_chart_' + id);
        return await iframSelector?.evaluate(el => el.getAttribute("src"));
    }
}
  
module.exports = ScrappingService;