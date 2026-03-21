const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", () => { console.log("JSDOM ERROR:", arguments); });
virtualConsole.on("jsdomError", (err) => { console.log("JSDOM JS ERROR:", err.message); });
virtualConsole.sendTo(console);

JSDOM.fromURL("http://localhost:3001/", { runScripts: "dangerously", virtualConsole, resources: "usable" }).then(dom => {
  setTimeout(() => {
    const root = dom.window.document.getElementById('root');
    console.log("ROOT HTML LENGTH:", root ? root.innerHTML.length : 'null');
    if (root && root.innerHTML.length < 50) console.log("ROOT HTML:", root.innerHTML);
    process.exit(0);
  }, 5000);
});
