# dockerize-bind9-rpz-monitor-backend
Bind9 RPZ monitor made with node js and docker

## How to Install

1. Build the image
`docker build -t <desired tag> .`

2. Create the container
`docker run -d --name <container name> -p 1053:53/udp -p 1053:53/tcp -p 3000:3000 <image tag>:latest`

PS: for port 1053, it can be other port like 53, but change the router to be able to port forward the dns traffic to the custom port.