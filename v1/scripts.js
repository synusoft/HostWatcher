function sendRequest(addr)
{
    var request;
    if (window.XMLHttpRequest) {
        request = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        request = new window.ActiveXObject();
    } else {
        alert("请升级至最新版本的浏览器");
    }
    if (request != null) {
        request.open("GET", addr, true);
        request.send(null);
    }
    return request;
}
function loadServers(addr)
{
    var request = sendRequest(addr);
    if (request != null)
    {
        request.onreadystatechange = function () 
        {
            if (request.readyState == 4 && request.status == 200) 
            {
                var json = JSON.parse(request.responseText);
                console.log(json);

                serversElement = document.getElementById("servers");
                var innerHtmls = "";
                for (var obj in json) {
                    console.log(json[obj]);
                    innerHtmls = innerHtmls + 
                    "<div id=\""+json[obj].Name+"\">"+
                    " <span class=\"name\"> "+json[obj].Name+" </span>"+
                    " <span class=\"address\"> Address:xx.xx.xx.xx </span>"+
                    " <span class=\"status\" > Waiting... </span>"+
                    " <a href=\"http://"+json[obj].Address+"\">Link</a></div>"
                }
                //alert(innerHtmls);
                serversElement.innerHTML=innerHtmls;
            }
        };

    }
}
function loadStatus(addr)
{
    var request = sendRequest(addr);
    if (request != null)
    {
        request.onreadystatechange = function () 
        {
            if (request.readyState == 4 && request.status == 200) 
            {
                var json = JSON.parse(request.responseText);
                console.log(json);
                for (var obj in json) {
                    divElement = document.getElementById(json[obj].Name);
                    addressElement = divElement.getElementsByClassName("address")[0];
                    addressElement.innerText = "IP: "+json[obj].Address;
                    statusElement = divElement.getElementsByClassName("status")[0];
                    if(json[obj].PingSucceeded)
                    {
                        statusElement.className="online";
                        statusElement.innerText="online";
                    }
                    else
                    {
                        statusElement.className="offline";
                        statusElement.innerText="offline";
                    }
                }
            }
        };

    }
}