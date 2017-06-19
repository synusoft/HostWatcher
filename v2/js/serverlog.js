
function timeSpan(start,end)
{
    var spansec = (end.getTime() - start.getTime())/1000
    var sec = spansec % 60;
    var min = Math.floor(spansec/60) % 60;
    var hour = Math.floor(spansec/3600) % 24;
    var day = Math.floor(spansec/86400);
    var value = "";
    if(day != 0)
    {
        return day+"d"+hour+"h"+min+"m"+sec+"s";
    }
    else if(hour != 0)
    {
        return hour+"h"+min+"m"+sec+"s";
    }
    else if(min != 0)
    {
        return min+"m"+sec+"s";
    }
    else
    {
        return sec+"s";
    }
}
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
                switch(status_val)
                {
                     case "online": color="success";break;
                     case "offline": color="danger";break;
                     case "unknown": color="warning";break;
                }
                $("#log-table").append("<tr class=\""+
                    color+"\"><td>"+
                    timeSpan(new Date(start),new Date(end))+"</td><td>"+
                    start+"</td><td>"+
                    end+"</td></tr>")
            }

        })
    });
});
