function init() {
  console.log("initializing..");

}


document.addEventListener('DOMContentLoaded', function () {
  initialize();
  addListeners();

});

function initialize() {

  var apiRequest;
  chrome.storage.local.get(function (obj) {
    //console.log(obj);
    chrome.storage.local.get(function (cfg) {
      if (typeof (cfg["APIRequest"]) !== 'undefined') {

        apiRequest = cfg["APIRequest"];
        var url = apiRequest.requests[apiRequest.requests.length - 1].url;
        setElementValue("url", url);

        prepareHistory(apiRequest);

      }
      chrome.storage.local.set(cfg);
    });
    //var url = obj.request.url;
    //setElementValue("url",url);
  });


  appendCodeMirrorInTest();
  appendCodeMirrorInResponseBody();
  appendCodeMirrorInRequestBody();

}
function appendCodeMirrorInTest() {

  var testRequestPanel = getElement("request-helper-test");
  this.codeMirrorTestRequestPanel = CodeMirror(testRequestPanel, {
    lineNumbers: true,
    value: 'tests["Content-Type is present"] = responseHeaders.hasOwnProperty("Content-Type");\ntests["Status code is 200"] = responseCode.code === 200;',
    mode: "javascript"
  });
  hide("request-helper-test");
}

function appendCodeMirrorInRequestBody() {
  var requestBody = getElement("request-body");//request-body getElement("request-body")
  this.codeMirrorRequestBody = CodeMirror(requestBody, {
    lineNumbers: true,
    value: "",
    mode: "javascript"
  });
  hide("request-body");
}

function appendCodeMirrorInResponseBody() {

    var requestBody = getElement("response-text");
  this.codeMirrorResponseBody = CodeMirror(requestBody, {
    lineNumbers: true,
    value: "",
    mode: "javascript",
    lineWrapping : true
  });
}

function addListeners() {
  getElement("submit-request").addEventListener("click", sendRequest);
  getElement("basicAuth").addEventListener("click", activateBasicAuthTab);
  getElement("tests").addEventListener("click", activateTestTab);
  getElement("normal").addEventListener("click", activateNormalTab);
  getElement("history-actions-delete").addEventListener("click", clearHistory);
  getElement("history-items").addEventListener("click", resumeHistory);
  getElement("response-body-toggle").addEventListener("click", responseBodyToggle);
  getElement("request-authenticate-submit").addEventListener("click", authenticate);
  getElement("sidebar-toggle").addEventListener("click", sidebarToggle);
  getElement("request-method-selector").addEventListener("change", onMethodChange);
}

function onMethodChange() {
  var method = getElementValue("request-method-selector");

  if (method == 'PUT' || method == 'POST') {
    show("request-body");
    var requestBody = getElement("request-body");
  }
  else {
    hide("request-body");
  }

}


function sidebarToggle() {
  var sidePanelIsClosed = getElement("sidebar").style.width == '0px';

  if (!sidePanelIsClosed) {
    getElement("sidebar").style.width = '0px';
    getElement("main").style.marginLeft = '0px';
    getElement("sidebar-toggle").style.left = '0px';
  }
  else {
    getElement("sidebar").style.width = '350px';
    getElement("main").style.marginLeft = '350px';
    getElement("sidebar-toggle").style.left = '350px';
  }

}
function authenticate() {
  var url = getElementValue("url");
  var username = getElementValue("request-helper-basicAuth-username");
  var password = getElementValue("request-helper-basicAuth-password");


  if (username == "" && password == "" && url == "") {
    shakeAuthentication();
    return;
  }
  var host = getHost(url);

  var request = new XMLHttpRequest();
  request.onreadystatechange = onAuthenticationRequest;
  var method;
  var params = "";
  if (host == "localhost") {
    method = "POST"
    url = "http://localhost/RetailWebAPI/Public/Security.asmx/Authenticate";
    params = "loginName=" + username + "&password=" + password;
    //request.open("POST", "http://localhost/RetailWebAPI/Public/Security.asmx/Authenticate");
    //request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    //request.send("loginName=" + username + "&password=" + password);
  }
  else {
    method = "GET";
    url = "http://" + host + "/retail/data/login?loginName=" + username + "&password=" + password;
    //request.open("GET", "http://" + host + "/retail/data/login?loginName=" + username + "&password=" + password); // use string format
    // request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    //request.send();
  }
  request.open(method, url);
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  request.send(params);
}
function onAuthenticationRequest() {

  if (this.readyState == this.DONE) {
    if (this.status == 404) {
      alert("404 : Not Found")
    }
    else if (this.status == 200) {
      if (getHost(this.responseURL) == "localhost") {
        if (this.responseText.indexOf("Authenticated") > -1 && this.responseText.indexOf("NotAuthenticated") == -1) //Authenticated
        {
          getElement("authentication-status").innerText = "Authenticated";
        }
        else {
          getElement("authentication-status").innerText = "Forbidden";
          alert(this.responseText);
        }
      }
      else {
        getElement("authentication-status").innerText = "Authenticated";
      }
    }
    else {
      alert(this.responseText);
      getElement("authentication-status").innerText = "Forbidden";
    }
  }
}

function getHost(url) {
  var pathArray = url.split('/');
  var host = pathArray[2];
  return host;
}

function shakeAuthentication() {
  var usernameHolder = getElement("username-holder");
  var passwordHolder = getElement("password-holder");

  usernameHolder.style.animation = 'shake 500ms ease-in-out';
  passwordHolder.style.animation = 'shake 500ms ease-in-out';


  setTimeout(function () {

    usernameHolder.style.animation = '';
    passwordHolder.style.animation = '';
  }, 500);


}


function clearHistory() {
  chrome.storage.local.clear();
  getElement("history-items").innerHTML = "";
}
function responseBodyToggle() {
  var responseBody = getElement("response-data");
  if (responseBody.getAttribute("style") == "") {
    var style = "display: block; position: absolute; left: 0px; top: 0px; width: 98%; height: 98%; z-index: 100; padding: 10px; background-color: rgb(255, 255, 255);";
    responseBody.setAttribute("style", style);
  }
  else {
    responseBody.setAttribute("style", "");
  }
}
function resumeHistory(event) {
  var id = event.target.getAttribute("id");
  console.log(id);
  setRecordById(id);

}

function setRecordById(id) {
  chrome.storage.local.get(function (cfg) {
    if (typeof (cfg["APIRequest"]) !== 'undefined') {

      apiRequests = cfg["APIRequest"];
      apiRequests.requests.forEach(function (record) {
        if (record.id == id) {
          setElementValue("url", record.url);
          setElementValue("request-method-selector", record.method);
        }
      })
    }
  });
}


function prepareHistory(records) {
  var historyElements = "";
  records.requests.forEach(function (record) {
    historyElements = historyElements + getHistoryElement(record.id, record.url, record.method)
  })

  getElement("history-items").innerHTML = historyElements;
}

function getHistoryElement(id, url, method) {

  return element = '<li id="' + id + '"style="margin: 3px;" class="sidebar-history-request"> <div id="' + id + '" class="request" data-request-id="b9d954a3-232b-f5c3-f576-005045e879c6"><pre id="' + id + '" style="margin-left: 5px;" class="request-name">' + method + ' : ' + url + '</pre></div></li>';
}

function activateNormalTab() {
  getElement("normal").setAttribute("class", "active");
  getElement("basicAuth").setAttribute("class", "");
  getElement("tests").setAttribute("class", "");
  hide("request-helpers");
}

function activateBasicAuthTab() {
  getElement("basicAuth").setAttribute("class", "active");
  getElement("normal").setAttribute("class", "");
  getElement("tests").setAttribute("class", "");
  show("request-helpers");
  show("request-helper-basicAuth");
  hide("request-helper-test");
}
function activateTestTab() {
  getElement("tests").setAttribute("class", "active");
  getElement("normal").setAttribute("class", "");
  getElement("basicAuth").setAttribute("class", "");
  hide("request-helper-basicAuth");
  show("request-helpers");
  show("request-helper-test");
  codeMirrorTestRequestPanel.refresh();
}
function sendRequest() {
  /*
    if (getElement("authentication-status").innerText != "Authenticated") {
      shakeAuthentication();
      activateBasicAuthTab();
      return;
    }
  */
  var url = getElementValue("url");
  var method = getElementValue("request-method-selector");
  var username = getElementValue("request-helper-basicAuth-username");
  var password = getElementValue("request-helper-basicAuth-password");
  var requestBody = codeMirrorRequestBody.getValue();
  var apiRequest = new APIRequest(url, method, username, password);

  if (url != "") {
    var request = new XMLHttpRequest();
    request.onreadystatechange = onReady;
    request.open(method, url);
    request.setRequestHeader("Content-type", "application/json");
    request.send(requestBody);
    storeRequest(apiRequest);
  }
  show("response-waiting-container");
  hide("response-success-container");
}

function storeRequest(apiRequest) {
  chrome.storage.local.get(function (cfg) {
    if (typeof (cfg["APIRequest"]) !== 'undefined') {
      cfg["APIRequest"].requests.push(apiRequest);
    } else {
      chrome.storage.local.clear();
      cfg["APIRequest"] = new RequestStore();
      cfg["APIRequest"].requests.push(apiRequest);
    }
    chrome.storage.local.set(cfg);
    prepareHistory(cfg["APIRequest"])
  });
}

function onReady(request) {
  var responseText;
  if (this.readyState == this.DONE) {
    var responseSting = JSON.stringify(JSON.parse(this.responseText), undefined, 2);
    responseText = responseSting;
  }
  else {

  }
  showResponse("response-text", responseText);
}