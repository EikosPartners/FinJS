# install  http://aka.ms/servicefabricpacktool
# cd C:\Work\Source\epwebcat.FinJS-Demo

$SFPackagePath='C:\tools\ServiceFabricAppPackageUtil.exe'
$sourcePath1="C:\Work\Source\epwebcat.FinJS-Demo\web"
$sourcePath2="C:\Work\Source\epwebcat.FinJS-Demo\server"
$targetPath="C:\temp\deploy\TBDemo"

$nodePaths=cmd /C where node
$nodePath = if($nodePaths -is [array]) {$nodePaths[0]} else {$nodePaths}  

Write-Host $nodePaths  "xx"  $nodePath

if($nodePath) {
    if( $nodePath -ne ($pwd.ToString()+"\node.exe")){
        Write-Host 'Copying node'
        copy $nodePath  $sourcePath1 -Force        
        copy $nodePath  $sourcePath2 -Force        
    } else {
        Write-Host 'Nothing done'
    }   
}else{
    Write-Host 'Missing node'
    exit(1)
}


Remove-Item -Recurse -Force $targetPath
& $SFPackagePath /source:$sourcePath1 /target:$targetPath /appname:BlotterWebService /exe:node.exe /ma:./webserver.js /AppType:TradeBlotterDemoType
& $SFPackagePath /source:$sourcePath2 /target:$targetPath /appname:BlotterBackendService /exe:node.exe /ma:./app.js /AppType:TradeBlotterDemoType


# (Get-Content $targetPath\BlotterWebService\ServiceManifest.xml).replace('"http" Type=', '"http" Port="3000" Type=') | Set-Content $targetPath\BlotterWebService\ServiceManifest.xml
# (Get-Content $targetPath\BlotterBackendService\ServiceManifest.xml).replace('"http" Type=', '"http" Port="4080" Type=') | Set-Content $targetPath\BlotterBackendService\ServiceManifest.xml

cp $sourcePath1\ServiceManifest.xml $targetPath\BlotterWebService
cp $sourcePath2\ServiceManifest.xml $targetPath\BlotterBackendService


#connect to cluster
Connect-ServiceFabricCluster localhost:19000
#Connect-ServiceFabricCluster 192.168.1.52:19000
#Connect-ServiceFabricCluster -ConnectionEndpoint 192.168.1.52:19000

#deploy
Write-Host 'Copying application package...'
Copy-ServiceFabricApplicationPackage -CompressPackage -ApplicationPackagePath $targetPath -ImageStoreConnectionString 'file:C:\SfDevCluster\Data\ImageStoreShare' -ApplicationPackagePathInImageStore 'TradeBlotterDemoType'

Write-Host 'Registering application type...'
Register-ServiceFabricApplicationType -ApplicationPathInImageStore 'TradeBlotterDemoType' -TimeoutSec 1200

New-ServiceFabricApplication -ApplicationName 'fabric:/TradeBlotterDemo' -ApplicationTypeName 'TradeBlotterDemoType' -ApplicationTypeVersion 1.0




#remove application instance
Remove-ServiceFabricApplication -ApplicationName "fabric:/TradeBlotterDemo"
Unregister-ServiceFabricApplicationType  'TradeBlotterDemoType' -ApplicationTypeVersion 1.0
Remove-ServiceFabricApplicationPackage -ApplicationPackagePathInImageStore 'TradeBlotterDemoType'