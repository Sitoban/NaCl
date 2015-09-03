function show(id) {
  var component = document.getElementById(id);
  component.style.display = "block";
}
function hide(id) {
  var component = document.getElementById(id);
  component.style.display = "none";
}

function getElement(componentId) {
  return document.getElementById(componentId);
}

function getElementValue(componentId) {
  return document.getElementById(componentId).value;
}
function setElementValue(componentId, value){
  document.getElementById(componentId).value = value ;
}

function showResponse(responseElement, response) {
  var responseText = getElement(responseElement);
  responseText.innerText = response;
  hide("response-waiting-container");
  show("response");
  show("response-success-container");
}

function getStatus(status) {
  switch (status) {
    case 0:
      return "UNSENT";
    case 1:
      return "OPENED";
    case 2:
      return "HEADERS_RECEIVED";
    case 3:
      return "LOADING";
  }
}