let asap_domain;
if (window.location.host.indexOf("localhost") != -1 || window.location.host.indexOf("127.0.0.1:5500") != -1) {
    // asap_domain = "http://asap.genesys-tech.com:777/api";
    asap_domain = "http://localhost:49590/"
} else if (window.location.host.indexOf("192.168.0") != -1) {
    asap_domain = "http://asap.genesys-tech.com:777/api";
    // asap_domain = "http://localhost:49590/"
} else {
    asap_domain = location.protocol + "//" + window.location.host + "/api";
}

/**
 * 回傳API訊息格式
 * @description API 呼叫完之後的回傳結果
 * @param {string} message 訊息
 * @param {*} data 資料
 * @param {boolean} success 是否成功
 * @param {number} page 頁碼
 */
class ResultObj {
    constructor({ message = "", data = new Array(), success = false, page = 0 }) {
        this.message = message;
        this.data = data;
        this.success = success;
        this.page = page;
    }
}

const fetch_Asap_api = async function (obj = {}, url = null, token = true) {
    if (url === null) {
        console.error("API URL 為必填");
        throw new Error("API URL 為必填");
    }
    let headers = token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('token')}`, 'pragma': 'no-cache', 'cache-control': 'no-cache' } : { 'Content-Type': 'application/json', 'pragma': 'no-cache', 'cache-control': 'no-cache' };
    let result_json = await fetch(asap_domain + "/" + url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(obj)
    }).then((response) => {
        return response.json();
    }).then((jsonData) => {
        if (jsonData.Message == "偵測帳號從不同位置登入") {
            console.warn("偵測帳號從不同位置登入");
            alert("偵測帳號從不同位置登入");
            sessionStorage.clear();
            window.location = "./login.html";
        }
        return jsonData;
    }).catch((err) => {
        console.error('錯誤:', err);
        return err;
    })
    return result_json;
}


/**
 * 不支援 - IE /  Safari PC 10.1/IOS 10.3 past
 */
const fetch_file_Asap_api = async function (obj = {}, url = nll, token = true) {
    if (url === null) {
        console.error("API URL 為必填");
        throw new Error("API URL 為必填");
    }
    let headers = token ? { 'Authorization': `Bearer ${sessionStorage.getItem('token')}`, 'pragma': 'no-cache', 'cache-control': 'no-cache' } : { 'pragma': 'no-cache', 'cache-control': 'no-cache' };
    let result_json = await fetch(asap_domain + "/" + url, {
        method: "POST",
        headers: headers,
        body: obj
    }).then((response) => {
        return response.json();
    }).then((jsonData) => {
        if (jsonData.Message == "偵測帳號從不同位置登入") {
            console.warn("偵測帳號從不同位置登入");
            alert("偵測帳號從不同位置登入");
            sessionStorage.clear();
            window.location = "./login.html";
        }
        return jsonData;
    }).catch((err) => {
        console.error('錯誤:', err);
        return err;
    })
    return result_json;
}


/**
 * 網頁錯誤回報
 * @param {String} errorMessage   錯誤訊息
 * @param {String} scriptURI      出錯的文件
 * @param {number} lineNumber     出錯的行號
 * @param {number} columnNumber   出錯的代碼列號
 * @param {Object} errorObj       詳細的錯誤訊息
 */
window.onerror = function (errorMessage, scriptURI, lineNumber, columnNumber, errorObj) {
    console.error("錯誤訊息:", errorMessage);
    console.error("出錯的文件:", scriptURI);
    console.error("出錯的行號:", lineNumber);
    console.error("出錯的代碼列號:", columnNumber);
    console.error("詳細的錯誤訊息:", errorObj);
    let errorFileArr = scriptURI.split("/");
    let errorFile = errorFileArr[errorFileArr.length - 1];
    let alertDiv = document.createElement("div");
    alertDiv.id = "ERROR-alert";
    alertDiv.style = "z-index: 2005; position: fixed; top: 0; left: 0; display: flex; background: #00000090; flex-direction: column; width: 100vw; height: 100vh; align-items: center; justify-content: center;";
    let p = document.createElement("p");
    p.style = "background: #fff; padding: 1rem; margin: 0;";
    p.innerHTML = [
        "<strong>發生錯誤，請回報開發人員</strong><hr>錯誤訊息:&nbsp;" + errorMessage,
        "出錯的文件:&nbsp;" + errorFile,
        "出錯的行號:&nbsp;***" + lineNumber,
        "出錯的代碼列號:&nbsp;" + columnNumber,
        "詳細的錯誤訊息:&nbsp;" + errorObj,
        "<hr>請將畫面截圖或拍照給開發人員"
    ].join("<br>");
    let btn = document.createElement("button");
    btn.type = "button";
    btn.innerText = "重新登入";
    btn.style = "width: 100%; margin-top: 1rem; outline: none; border: none; background: #ccc; border-radius: 4px;";
    btn.onclick = () => window.location = "./login.html";
    p.append(btn);
    alertDiv.append(p);
    setTimeout(() => { document.querySelector("body").append(alertDiv); }, 1000);
}