
$(document).ready(function() {

    //ajax
    $.get("/data/log/"+window.servername+".txt",function(data,status){
        window.logs = data;

        strlist = window.logs.split('\n');

        //delayList = [];

        $.each(strlist, function(idx,obj) {
            if(obj!="")
            {
                var obj_split = obj.split(',');
                var start = obj_split[0].slice(1,-1);
                var end = obj_split[1].slice(1,-1);
                var status_val = obj_split[2].slice(1,-2);
                var color;
                //var timespan = new
                console.log(Date(end)-Date(start))
                switch(status_val)
                {
                     case "online": color="success";break;
                     case "offline": color="danger";break;
                     case "unknown": color="warning";break;
                }
                $("#log-table").append("<tr class=\""+color+"\"><td>"+status_val+"</td><td>"+start+"</td><td>"+end+"</td></tr>")
            }

        })
    });
});