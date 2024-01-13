sudo docker kill bind9_backend

sudo docker rm bind9_backend

sudo docker rmi bind9_backend

sudo sed -i "s|nameserver .*|nameserver 8.8.8.8 |" "/etc/resolv.conf"

sudo docker build -t bind9_backend:latest .

sudo systemctl stop systemd-resolved.service

sudo docker run -d --name bind9_backend -p 53:53/udp -p 53:53/tcp -p 3000:3000 bind9_backend:latest

sudo systemctl start systemd-resolved.service

sudo sed -i "s|nameserver .*|nameserver 192.168.0.6 |" "/etc/resolv.conf"