# dockerize-bind9-rpz-monitor-backend
Bind9 RPZ monitor made with node js and docker

## How to Install

1. Build the image
`docker build -t <desired tag> .`

2. Create the container
<<<<<<< HEAD
`docker run -d --name <container name> -p 53:53/udp -p 53:53/tcp -p 3000:3000 <image tag>:latest`

3. seeing the log of bind9 query
`docker exec -it <container name> tail -f  /var/log/bind/query.log`
=======
`docker run -d --name <container name> -p 1053:53/udp -p 1053:53/tcp -p 3000:3000 <image tag>:latest`

PS: for port 1053, it can be other port like 53, but change the router to be able to port forward the dns traffic to the custom port.
>>>>>>> e4238d0d1af2f69e80b7aa5789510f0f996993b7
