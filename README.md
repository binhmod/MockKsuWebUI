# MockKsuWebUI
A library that mocks the window.ksu API, allowing you to develop and debug KernelSU WebUI interfaces directly in a desktop browser.
## Usage
 1. **Include Script:** Load script.js in your project before your application logic.
   ```html
   <script src="script.js"></script>
   
   ```
 2. **Access API:** Use the standard window.ksu methods as you would in the production environment:
   ```javascript
   window.ksu.exec("whoami", "{}", "myCallback");
   window.ksu.toast("mock hello");
   
   ```
 3. **Customization:** Modify the logic within createMockChildProcess and mockKsu inside script.js to simulate specific command outputs, shell results, or custom data structures.
## Supported APIs
| Category | Method | Description |
|---|---|---|
| **Shell** | exec | Executes a shell command and returns results via callback. |
|  | spawn | Spawns a child process and handles events (stdin/stdout). |
| **System UI** | toast | Displays a temporary notification on screen. |
|  | fullScreen | Toggles the browser's Fullscreen mode. |
|  | enableEdgeToEdge | Applies CSS resets for edge-to-edge layout. |
|  | exit | Triggers a confirmation to close the application. |
| **Data** | moduleInfo | Returns metadata about the module. |
|  | listPackages | Returns a list of installed packages. |
|  | getPackagesInfo | Retrieves detailed info for specific packages. |
