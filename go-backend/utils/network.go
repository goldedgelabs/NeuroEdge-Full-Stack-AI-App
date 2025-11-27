package utils

import (
    "net"
)

func LocalIP() string {
    addrs, err := net.InterfaceAddrs()
    if err != nil { return "127.0.0.1" }
    for _, a := range addrs {
        if ipnet, ok := a.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
            if ipnet.IP.To4() != nil {
                return ipnet.IP.String()
            }
        }
    }
    return "127.0.0.1"
}
