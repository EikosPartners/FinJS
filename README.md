# FinJS Demo Application - WPF vs WEB Technologies

This is a project written for the the Eikos Partners presentation at the New York FinJS Event on October 6 2016.  It compares the performace of two (2) applications, one written in WPF and .NET and the other in OpenFin and HTML5.  A recording of the presentation can be viewed on YouTube: [FinJS Video](https://www.youtube.com/watch?v=ykq8ltnPd34&list=PLwg9Lof7il0frKHsEYHcdEZYuwZJRh2ub)

Complied installation packages can be download from here if you wish to avoid having to run via npm:

* <a target="_blank" href="http://blotter.eikospartners.com/install">http://blotter.eikospartners.com/</a>

There are three (3) core components to this repo:

1. Server - The node.js database server which provides the simulation data via WebSockets (\server).

2. Web - The node.js web server which provides all of the html and JavaScript content to run the application in both OpenFin and Electron Desktop APIs as well as any modern web browser (\web).

3. WPF - The .NET WPF application written in C# (\wpf).

Each of the above referenced folders contain their own README.md file with instruction on how to set up and start each.  The basic steps to start after setup is complete are:

* Start the backend server using `server\npm start`
* Start the web server using `\web\npm start` and connect using the OpenFin or Electron application or via the browser.
* Optionally, the WPF project can be ran to connect to the same backend for comparison.