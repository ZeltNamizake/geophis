# GeoPhis

GeoPhis is a tool created to study how geolocation requests work in the browser and how the data is
sent to the server using HTTP. This tool does not use external frameworks such as Express, but only the
native http of Node.js to maintain simplicity and transparency.

```bash
                         &&&&&          GeoPhis - Geolocation Phising via Nodejs HTTP Server
                     &&&&     &
                  &&&    &&&&&          Usage: node geophis [Options]
               &&    &&&&&&& &
             &&   &&& &&&&   &          Options:
            &   && &&&&      &           -p <PORT> : Port for HTTP Server
         &&   &&&&           &           -t ngrok|serveo : Methode tunneling with ngrok/serveo
        &&  &&               &           -wl <URL>|none : Destination link after get location
       && &&&&             &&&&&
      &  && &&           &&&&&&&&&      Example:
     &  &&  &&          &&&     &&&      node geophis -p 8080 -t ngrok -wl http://example.com
    && &&  &&           &&&     &&&      node geophis -p 8080 -t serveo -wl mone
    &  &  &&             &&&&&&&&&
   &  &&&&&               &&&&&&&       Legal disclaimer
  && &      &&             &&&&&        GeoPhis is developed and distributed for ethical research
 &&  &  &&  &&              &&&         purposes only, and demonstration. The developers of this
 &    &     && &             &          tool are not responsible for any misuse.
 &    &&&& &&  &
&&    &     &  &
&&    &      &                          Source: https://github.com/ZeltNamizake/geophis
 &&&&&
```

### This tool is not intended to:
- Illegal activities such as phishing against other parties without permission.
- Tracking or obtaining location information without the user's explicit consent.
- Violates privacy, digital etiquette, or applicable laws in any country.

## Example Workflow 
1. Server runs on local port.
2. Tunneling through Ngrok/Serveo provides public URL.
3. Visitor opens URL and browser asks for location permission.
4. If approved, location data is sent to server.
5. Server records location on terminal and redirects to endpoint (-wl).

# Features 
- Simple local HTTP server.
- Location request from browser via navigator.geolocation.
- Sending location data (latitude & longitude) to server using POST.
- Automatic forwarding via Serveo or Ngrok.
- Fallback support if Ngrok token is not available.
- Location output is sent directly to terminal.
- Error handler and request validation.

# Requirement
- __Nodejs v20+ and NPM__ for javascript execution and install module mgrok
- __Git__ required to clone this repository
- __OpenSSH__ for tunneling through Serveo
- __Module Ngrok__ for tunneling through Ngrok

# Install & Execution
```bash
apt update && apt upgrade -y
apt install git nodejs openssh -y
git clone https://github.com/ZeltNamizake/geophis
cd geophis
npm install @ngrok/ngrok
node geophis
```

# Disclaimer
GeoPhis is developed and distributed for ethical research
purposes only, and demonstration. The developers of this
tool are not responsible for any misuse.
