#load "nuget:https://www.nuget.org/api/v2?package=Cake.VsCode.Recipe&version=0.3.0"

if(BuildSystem.IsLocalBuild)
{
    Environment.SetVariableNames(
        githubUserNameVariable: "CAKE_GITHUB_USERNAME",
        githubPasswordVariable: "CAKE_GITHUB_PASSWORD"
    );
}
else
{
    Environment.SetVariableNames();
}

BuildParameters.SetParameters(context: Context,
                            buildSystem: BuildSystem,
                            title: "cake-vscode",
                            repositoryOwner: "cake-build",
                            repositoryName: "cake-vscode",
                            appVeyorAccountName: "cakebuild",
                            shouldRunGitVersion: true,
                            vsceVersionNumber:"1.78.0",
                            typeScriptVersionNumber: "4.1.2");

BuildParameters.PrintParameters(Context);

Task("lint")
    .IsDependentOn("Npm-Install")
    .IsDependeeOf("Package-Extension")
    .Does(() =>
{
    var proc = "node_modules/.bin/eslint";
    if(BuildParameters.IsRunningOnWindows) {
        proc += ".cmd";
    }

    var ret = StartProcess(proc, "-c .eslintrc.json --ext .ts src");
    if(ret != 0){
        throw new Exception("There were linting errors!");
    }
});

Task("Install-depcheck")
    .Does(() => {
    var settings = new NpmInstallSettings {
        Global = true,
        LogLevel = NpmLogLevel.Silent
    };
    settings.AddPackage("depcheck");
    NpmInstall(settings);
});

Task("depcheck")
    .IsDependentOn("Install-depcheck")
    .IsDependeeOf("Package-Extension")
    .Does(() =>
{
    var proc = "depcheck";
    if(BuildParameters.IsRunningOnWindows) {
        proc += ".cmd";
    }

    var ret = StartProcess(proc, "");
    if(ret != 0) {
        throw new Exception("There are unused dependencies.");
    }
});

Task("test")
    .IsDependeeOf("Package-Extension")
    .Does(() => {
    
    NpmRunScript(new NpmRunScriptSettings 
    {
        ScriptName = "vscode:prepublish",
        LogLevel = NpmLogLevel.Silent
    });

    var proc = "node";
    if(BuildParameters.IsRunningOnWindows) {
        proc += ".exe";
    }

    var ok = StartProcess(proc, "./out/test/runTest.js");
    if(ok != 0){
        throw new Exception("Unit tests failed!");
    }
});

Build.Run();
