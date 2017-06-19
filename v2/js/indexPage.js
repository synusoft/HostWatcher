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

        $("#hostlist_replace").text("");
        //add to ServersPage
        $.each(json,function(idx, obj) {

            $("#hostlist").append('\
            <div class="col-lg-3 col-md-6">\
                <div class="panel panel-primary" id="'+obj.id+'">\
                    <div class="panel-heading">\
                        <div class="row">\
                            <div class="col-xs-3">\
                                <i class="fa fa-desktop fa-5x"></i>\
                            </div>\
                            <div class="col-xs-9 text-right">\
                                <div class="huge" id="delay">0 ms</div>\
                                <div>'+obj.displayName+'</div>\
                            </div>\
                        </div>\
                    </div>\
                    <a href="server.html?id='+obj.id+'">\
                        <div class="panel-footer">\
                            <span class="pull-left">查看详情</span>\
                            <span class="pull-right"><i class="fa fa-arrow-circle-right"></i></span>\
                            <div class="clearfix"></div>\
                        </div>\
                    </a>\
                </div>\
            </div>')

        });

    });
}
function load_hoststatus()
{

    //ajax
    $.get("/data/host-status.json",function(data,status){

        window.hosts_status = data;

        $.each(data, function(idx,obj) {
            console.log(obj);

            switch(obj.status)
            {
                 case "online": color="green";break;
                 case "offline": color="red";break;
                 case "unknown": color="yellow";break;
            }

            $("#"+obj.id).attr("class","panel panel-"+color);
            if(obj.status == "online")
            {
                $("#"+obj.id).find("#delay").text(obj.delay+" ms");
            }
            else
            {
                $("#"+obj.id).find("#delay").text("∞");
            }
        })
    });
}


$(document).ready(function() {

    load_servers("../../servers.json");
    load_hoststatus();
});