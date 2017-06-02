Write-Host HostWatcher V0.1
Write-Host 一个监测远程主机工作状态的Web站点。通过ping命令来监测。
Write-Host 开始工作。。。
Write-Host
Write-Host
while("True")
{
    # 读取配置文件
    $hosts = (Get-Content ./Data/Data.JSON) | ConvertFrom-Json
    $jobs = New-Object -TypeName System.Collections.ArrayList
    foreach($obj in $hosts)
    {
        $job = Start-Job -ArgumentList $obj -ScriptBlock {
            param($obj) 
            $result = Test-NetConnection $obj.Address
            [PSCustomObject][Ordered]@{Name=$obj.Name; Address=$result.RemoteAddress.IPAddressToString; PingSucceeded=$result.PingSucceeded; Delay=$result.PingReplyDetails.RoundtripTime}
        }
        $null = $jobs.Add($job)

    }
    #等待任务完成
    $null = $jobs | Wait-Job
    #输出
    $status = New-Object -TypeName System.Collections.ArrayList
    foreach($job in $jobs)
    {
        $val = $job.ChildJobs.Output
        $null = $status.Add([PSCustomObject]@{Name=$val.Name;Address=$val.Address;PingSucceeded=$val.PingSucceeded;Time=$(Get-Date)})
        if($val.PingSucceeded -eq "True")
        {
            Write-Host [$(Get-Date)][ $val.Name ][ $val.Address ] in $val.Delay ms -ForegroundColor Green 
        }
        else
        {
            Write-Host [$(Get-Date)][ $val.Name ][ $val.Address ] Failed -ForegroundColor Red
        }
    }
    $null = $jobs | Remove-Job
    $status | ConvertTo-Json | Out-File ./Data/host-status.json
}
