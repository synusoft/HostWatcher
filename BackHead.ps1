
Write-Host HostWatcher V0.2
Write-Host 一个监测远程主机工作状态的Web站点。通过ping命令来监测。
Write-Host 开始工作。。。
Write-Host
Write-Host

# 读取配置文件
$hosts_name_json = (Get-Content ./servers.json) | ConvertFrom-Json
# 首次执行
$frist_run = 'true'
#初始化目录

if(-not (Test-Path "./data/delay/")){
    mkdir "./data/delay/" | Out-Null
}
if(-not (Test-Path "./data/log/")){
    mkdir "./data/log/" | Out-Null
}

#初始化状态文件

$filename = "./data/host-status.json";
if(Test-Path $filename){
    $hosts_status_json = (Get-Content $filename) | ConvertFrom-Json
}else{
    $hosts_status_json = New-Object -TypeName System.Collections.ArrayList
}

#初始化Delay文件
$hosts_delay_json_dic = New-Object 'System.Collections.Generic.Dictionary[[string],[System.Collections.ArrayList]]'
foreach($host_obj in $hosts_name_json)
{
    $filename = "./data/delay/"+ $host_obj.id + ".json";
    if(Test-Path $filename){
        $host_delay_json = (Get-Content ($filename)) | ConvertFrom-Json;
    }else{
        $host_delay_json = New-Object -TypeName System.Collections.ArrayList
    }
    $hosts_delay_json_dic.Add($host_obj.id,$host_delay_json) | Out-Null

}
#初始化Log文件
$hosts_log_json_dic = New-Object 'System.Collections.Generic.Dictionary[[string],[PSCustomObject]]'
foreach($host_obj in $hosts_name_json)
{
    $filename = "./data/log/"+ $host_obj.id + ".txt";
    if(Test-Path $filename){
        $str = (Get-Content ($filename))[-1];
        #只有一行的处理办法
        if($str.Length -eq 1)
        {
            $str = (Get-Content ($filename));
        }
        $host_log_json =  [PSCustomObject][Ordered]@{start=$str.Split(',')[0];end=$str.Split(',')[1];status=$str.Split(',')[2]}
    }else{
        $host_log_json = [PSCustomObject][Ordered]@{start=$(Get-Date);end=$(Get-Date);status=""}
        #Out-File $filename
    }
    $hosts_log_json_dic.Add($host_obj.id,$host_log_json) | Out-Null
}

while("True")
{
    $jobs = New-Object -TypeName System.Collections.ArrayList

    #添加Internet状态任务
    $job = Start-Job -Name "Test-NetConnection" -ScriptBlock {
            $result = Test-NetConnection
            [PSCustomObject][Ordered]@{id="InternetBeacon";displayName="InternetBeacon"; address = "" ;ip=$result.RemoteAddress.IPAddressToString; pingSucceeded=$result.PingSucceeded; delay=$result.PingReplyDetails.RoundtripTime}
    }
    $jobs.Add($job) | Out-Null
    #添加普通任务
    foreach($obj in $hosts_name_json)
    {
        $job = Start-Job -ArgumentList $obj -ScriptBlock {
            param($obj)
            $result = Test-NetConnection $obj.address;
            [PSCustomObject][Ordered]@{id=$obj.id;displayName=$obj.displayName; address = $obj.address ;ip=$result.RemoteAddress.IPAddressToString; pingSucceeded=$result.PingSucceeded; delay=$result.PingReplyDetails.RoundtripTime}
        }
        $jobs.Add($job) | Out-Null

    }
    #等待任务完成
    $jobs | Wait-Job | Out-Null
    #输出

    $ThisComputerIsOnline = ($jobs | foreach{$_.ChildJobs.Output.pingSucceeded} | Where {$_}).count -cgt 0

    $jobs[0] | Remove-Job
    $jobs.RemoveAt(0);
    foreach($job in $jobs)
    {
        $val = $job.ChildJobs.Output
        if($val.pingSucceeded)
        {
            $delay = $val.delay
            $statusString = "online"
            Write-Host [$(Get-Date)][ $val.displayName ][ $val.Address ] in $val.Delay ms -ForegroundColor Green 
        }
        elseif($ThisComputerIsOnline)
        {
            $delay = 0
            $statusString = "offline"
            Write-Host [$(Get-Date)][ $val.displayName ][ $val.Address ] Failed -ForegroundColor Red
        }
        else
        {
            $delay = 0
            $statusString = "unknown"
            Write-Host [$(Get-Date)][ $val.displayName ][ $val.Address ] Unknown -ForegroundColor Gray
        }
        #记录到状态
        $obj = $hosts_status_json | where id -EQ $val.id
        if($obj -ne $null)
        {
            $obj.address=$val.address;$obj.ip = $val.ip;$obj.delay = $delay;$obj.status=$statusString;$obj.time=$(Get-Date)
        }
        else
        {
            $hosts_status_json.Add([PSCustomObject]@{id=$val.id;address=$val.address;ip = $val.ip;delay = $delay ;status=$statusString;time=$(Get-Date)}) | Out-Null
        }
        #记录到delay列表
        $hosts_delay_json_dic[$val.id].Add([PSCustomObject]@{delay=$delay;time = $(Get-Date) }) | Out-Null
        if($hosts_delay_json_dic[$val.id].Count -cgt 300){
            $hosts_delay_json_dic[$val.id].RemoveAt(0) | Out-Null
        }
        #记录到log列表
        $status_obj = $hosts_status_json | where id -EQ $val.id
        if($hosts_log_json_dic[$val.id].status -ne $status_obj.status -or $frist_run -eq 'true'){

            #log改变或首次
            $hosts_log_json_dic[$val.id].start = $(Get-Date);
            $hosts_log_json_dic[$val.id].end = $(Get-Date);
            $hosts_log_json_dic[$val.id].status = $status_obj.status;
            ($hosts_log_json_dic[$val.id] | ConvertTo-Csv).Split(0x10)[-1] | Out-File -Append ("./data/log/"+ $val.id + ".txt")
            $frist_run = 'false'
        }
        else{
            #log不变
            $hosts_log_json_dic[$val.id].end = $(Get-Date);
            $source = (Get-Content ("./data/log/"+ $val.id + ".txt"))
            if($source.GetType() -eq [String])#只有一条
            {
                $source = ($hosts_log_json_dic[$val.id] | ConvertTo-Csv).Split(0x10)[-1]
            }
            else
            {
                $source[-1] = ($hosts_log_json_dic[$val.id] | ConvertTo-Csv).Split(0x10)[-1]
            }
            $source | Out-File ("./data/log/"+ $val.id + ".txt")
        }
    }
    $jobs | Remove-Job
    $hosts_status_json | ConvertTo-Json | Out-File ./data/host-status.json
    $hosts_delay_json_dic.Keys | foreach { $hosts_delay_json_dic[$_] | ConvertTo-Json | Out-File ("./data/delay/"+ $_ + ".json")}
}
