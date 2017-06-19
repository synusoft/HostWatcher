// function sendRequest(addr)
// {
//     var request;
//     if (window.XMLHttpRequest) {
//         request = new XMLHttpRequest();
//     } else if (window.ActiveXObject) {
//         request = new window.ActiveXObject();
//     } else {
//         alert("请升级至最新版本的浏览器");
//     }
//     if (request != null) {
//         request.open("GET", addr, true);
//         request.send(null);
//     }
//     return request;
// }
function loadServers(addr)
{
    //ajax
    $.get(addr,function(json,status){

        serversElement = document.getElementById("servers-list");
        var innerHtmls = "";
        for (var obj in json) {
            innerHtmls = innerHtmls +
            " <li><a href=\"server.html?id="+json[obj].id+"\">"+
            json[obj].displayName+"</a></li>"
        }
        console.log(json);
        serversElement.innerHTML=innerHtmls;

    });
}

$(document).ready(function() {
    loadServers("../../servers.json");
};