function load_servers(addr)
{
    //ajax
    $.get(addr,function(json,status){

        // same as loadServers(addr)
        serversElement = document.getElementById("servers-list");
        var innerHtmls = "";
        for (var obj in json) {
            innerHtmls = innerHtmls +
            " <li><a href=\"server.html?id="+json[obj].id+"\">"+
            json[obj].displayName+"</a></li>"
        }
        console.log(json);
        serversElement.innerHTML=innerHtmls;

        //add to ServersPage
        $.each(json,function(idx, obj) {
            if(obj.id == window.servername)
            {
                $("#displayName").text(obj.displayName);
            }
        });

    });
}
function load_hoststatus()
{

    $("#id").text(window.servername);

    console.log(window.hosts);

    //ajax
    $.get("/data/host-status.json",function(data,status){

        window.hosts_status = data;

        $.each(data, function(idx,obj) {
            console.log(obj)
            if(obj.id == window.servername)
            {
                $("#address").text(obj.address);
                $("#ip").text(obj.ip);
                $("#link").attr("href","http://"+obj.address);
                $("#status").text(obj.status);
                $("#delay").text(obj.delay);
                switch(obj.status)
                {
                     case "online": $(".panel-default").addClass("panel-success");break;
                     case "offline": $(".panel-default").addClass("panel-danger");break;
                     case "unknown": $(".panel-default").addClass("panel-warning");break;
                }
                $("#time").text(Date(/Date\((\d+)\)/.exec(obj.time.value)[1]));
            }
        })
    });
}


$(document).ready(function() {

    load_servers("../../servers.json");
    load_hoststatus();
});