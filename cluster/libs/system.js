import exec from "./exec";

async function serialNumber(cmdPrefix) {
    cmdPrefix = cmdPrefix || "";
    let cmd;
    let shell = {};
    let delimiter = ": ";
    let vals = ["Serial", "UUID"];
    const uselessSerials = ["To be filled by O.E.M."];

    const parseResult = function (input) {
        var result = input.slice(input.indexOf(delimiter) + 2).trim();

        var isResultUseless = uselessSerials.some(function (val) {
            return val === result;
        });

        if (isResultUseless) {
            return "";
        }

        return result;
    };

    switch (process.platform) {
        case "win32":
            delimiter = "";
            vals[0] = "";
            vals[1] = "";
            shell = { shell: "powershell.exe" };
            cmd = "Get-WmiObject -Class Win32_ComputerSystemProduct | Select-Object -ExpandProperty UUID";
            break;

        case "darwin":
            cmd = "system_profiler SPHardwareDataType | grep ";
            break;

        case "linux":
            if (process.arch === "arm") {
                vals[1] = "Serial";
                cmd = "cat /proc/cpuinfo | grep ";
            } else {
                cmd = "dmidecode -t system | grep ";
            }
            break;

        case "freebsd":
            cmd = "dmidecode -t system | grep ";
            break;
    }

    if (!cmd) return cb(new Error("Cannot provide serial number for " + process.platform));

    if (serialNumber.preferUUID) vals.reverse();

    try {
        const result = await exec(cmdPrefix + cmd + vals[0], shell);
        return parseResult(result.stdout);
    } catch (error) {
        return "";
    }
}

serialNumber.preferUUID = false;

const useSudo = function () {
    serialNumber("sudo ");
};

export { serialNumber, useSudo };
