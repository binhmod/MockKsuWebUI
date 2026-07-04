<script
const mockPackages = {
  root: [
    { packageName: "com.example.app1", uid: 10001, label: "App 1" },
    { packageName: "com.example.app2", uid: 10002, label: "App 2" }
  ],
  system: [
    { packageName: "com.android.systemui", uid: 1000, label: "System UI" },
    { packageName: "com.android.settings", uid: 1001, label: "Settings" }
  ],
  all: [
    { packageName: "com.example.app1", uid: 10001, label: "App 1" },
    { packageName: "com.example.app2", uid: 10002, label: "App 2" },
    { packageName: "com.android.systemui", uid: 1000, label: "System UI" },
    { packageName: "com.android.settings", uid: 1001, label: "Settings" }
  ]
};

let spawnChildCounter = 0;

function createMockChildProcess(command, args, options, childCallbackName) {
  const childId = ++spawnChildCounter;
  const child = window[childCallbackName];
  
  console.log(`[Mock KSU] spawn called: ${command} ${JSON.stringify(args)}`);
  
  setTimeout(() => {
    if (command === "ls") {
      child.stdout.emit("data", "file1.txt\nfile2.txt\ndirectory1/\n");
      child.emit("exit", 0);
    } else if (command === "cat") {
      child.stdout.emit("data", "Mock file content here\n");
      child.emit("exit", 0);
    } else if (command === "pm" && args && args.includes("list")) {
      child.stdout.emit("data", "package:com.example.app1\npackage:com.example.app2\n");
      child.emit("exit", 0);
    } else if (command === "echo") {
      child.stdout.emit("data", (args ? args.join(" ") : "") + "\n");
      child.emit("exit", 0);
    } else {
      child.stdout.emit("data", `Mock output for command: ${command}\n`);
      child.emit("exit", 0);
    }
  }, 100);
  
  return child;
}

const mockKsu = {
  exec: function(command, optionsJson, callbackFuncName) {
    console.log(`[Mock KSU] exec called: ${command}, options: ${optionsJson}`);
    
    const callback = window[callbackFuncName];
    
    if (!callback) {
      console.error(`[Mock KSU] Callback ${callbackFuncName} not found`);
      return;
    }
    
    setTimeout(() => {
      let errno = 0;
      let stdout = "";
      let stderr = "";
      
      if (command === "whoami") {
        stdout = "root\n";
      } else if (command === "id") {
        stdout = "uid=0(root) gid=0(root) groups=0(root) context=u:r:su:s0\n";
      } else if (command.startsWith("ls ")) {
        stdout = "file1.txt\nfile2.txt\ndirectory/\n";
      } else if (command === "getprop ro.product.model") {
        stdout = "MockDevice\n";
      } else if (command === "magisk -v") {
        stdout = "Mock KSU v1.0\n";
      } else if (command.startsWith("pm list packages")) {
        stdout = "package:com.example.app1\npackage:com.example.app2\n";
      } else if (command === "invalid_command_test") {
        errno = 127;
        stderr = "command not found: invalid_command_test\n";
      } else {
        stdout = `Mock output for: ${command}\n`;
      }
      
      callback(errno, stdout, stderr);
    }, 50 + Math.random() * 100);
  },
  
  spawn: function(command, argsJson, optionsJson, childCallbackName) {
    console.log(`[Mock KSU] spawn called: ${command}, args: ${argsJson}`);
    
    let args = [];
    try {
      args = JSON.parse(argsJson);
    } catch (e) {
      args = [];
    }
    
    let options = {};
    try {
      options = JSON.parse(optionsJson);
    } catch (e) {
      options = {};
    }
    
    const child = window[childCallbackName];
    
    if (!child) {
      console.error(`[Mock KSU] Child process ${childCallbackName} not found`);
      return;
    }
    
    child.pid = 10000 + spawnChildCounter;
    
    child.stdin.write = function(data) {
      console.log(`[Mock KSU] stdin write: ${data}`);
    };
    
    child.stdin.end = function() {
      console.log(`[Mock KSU] stdin end`);
    };
    
    child.kill = function(signal) {
      console.log(`[Mock KSU] kill process ${child.pid} with signal ${signal || 'SIGTERM'}`);
      child.emit("exit", signal === 'SIGKILL' ? 137 : 143);
    };
    
    createMockChildProcess(command, args, options, childCallbackName);
    
    return child;
  },
  
  fullScreen: function(isFullScreen) {
    console.log(`[Mock KSU] fullScreen: ${isFullScreen}`);
    if (isFullScreen && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (!isFullScreen && document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }
  },
  
  enableEdgeToEdge: function(enable) {
    console.log(`[Mock KSU] enableEdgeToEdge: ${enable}`);
    if (enable) {
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'hidden';
    }
  },
  
  toast: function(message) {
    console.log(`[Mock KSU] toast: ${message}`);
    const toastEl = document.createElement('div');
    toastEl.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      z-index: 10000;
      font-family: sans-serif;
      font-size: 14px;
      transition: opacity 0.3s;
    `;
    toastEl.textContent = message;
    document.body.appendChild(toastEl);
    
    setTimeout(() => {
      toastEl.style.opacity = '0';
      setTimeout(() => {
        if (toastEl.parentNode) {
          toastEl.parentNode.removeChild(toastEl);
        }
      }, 300);
    }, 2000);
  },
  
  moduleInfo: function() {
    console.log(`[Mock KSU] moduleInfo called`);
    return JSON.stringify({
      id: "mock_ksu",
      name: "MockKSUWebUI",
      version: "1.0.0",
      versionCode: 1,
      author: "binhmod",
      description: "https://github.com/binhmod/MockKsuWebUI"
    });
  },
  
  listPackages: function(type) {
    console.log(`[Mock KSU] listPackages: ${type}`);
    const packages = mockPackages[type] || mockPackages.all;
    return JSON.stringify(packages);
  },
  
  getPackagesInfo: function(packagesJson) {
    console.log(`[Mock KSU] getPackagesInfo: ${packagesJson}`);
    
    let packages = [];
    try {
      packages = JSON.parse(packagesJson);
    } catch (e) {
      return JSON.stringify([]);
    }
    
    const info = packages.map(pkg => ({
      packageName: pkg,
      label: pkg.split('.').pop(),
      uid: 10000 + Math.floor(Math.random() * 1000),
      versionName: "1.0.0",
      versionCode: 1,
      isSystem: pkg.includes("android") || pkg.includes("system")
    }));
    
    return JSON.stringify(info);
  },
  
  exit: function() {
    console.log(`[Mock KSU] exit called`);
    if (confirm("App wants to exit. Close this tab?")) {
      window.close();
    }
  }
};

window.ksu = mockKsu;

console.log('[Mock KSU] KernelSU API mock loaded');
console.log('[Mock KSU] Available methods:', Object.keys(mockKsu).join(', '));
</script>
