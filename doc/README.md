# Kung Fu Pro

> 一个灵活的代理解决方案
> 
> 通过 DNS 劫持，充当部分网段网关角色，通过 NAT 方式实现一机配置，让整个内网均能无感的使用代理。
> 相比传统方式效率更高性能更强，也更方便扩容。专为企业大内网环境设计，同时本身比较小巧，能在路由器运行，适合家用。
> 

## 目标人群

* **企业用户** <br>
  企业内部，由 IT 部门在网络层统一配置，实现部分部门或者整个内网科学上网，方便通过 Google 检索资料。<br>

* **家庭用户** <br>
  通过在路由器或者现有的 NAS、树莓派、小型工控机等方式，统一配置，实现内网所有设备，包括电视，电视盒子，手机等科学上网。

* **海外用户** <br>
  少量需要长期配置代理访问限制资源的用户。

* **其他** <br>
  同时需要使用多个代理的用户，例如：一个代理看 netflix, 另外一些代理用来访问 google，telegram 等

> 不适用：这是一个服务器软件，因此不适用直接在手机端运行。 <br>
> 例外：如果你使用的是 Mac 或者 linux 倒是直接可以在本机使用。windows 版本暂时不支持（也许以后会开发）。

## 预览
  管理界面登录
  ![](../static/prev0.png)
  代理配置
  ![](../static/prev1.png)
  规则配置
  ![](../static/prev2.png)

## 网络拓扑
  ![](../static/topology.svg)

## 安装
  基于 Go 语言开发，仅单个可执行文件，解压即用，更好的跨平台。
```bash
-rw-r--r--  1 clachlan978  staff   210B Dec  1 00:30 config.example.json
-rwxr-xr-x  1 clachlan978  staff    16M Dec  1 00:30 kungfu
drwxr-x---  2 clachlan978  staff    64B Dec  1 00:30 logs
```

## 配置

仅一个配置文件，参考 `config.example.json`，重命名为 `config.json`

```json
{
  "network": "10.86.0.1/16",
  "manage": {
    "address": "0.0.0.0:3001",
    "auth": {
      "admin": "123456"
    }
  }
}
```

network 表示经过劫持的 DNS 使用该网段 <br>
manage: 管理界面设置 <br>
  &nbsp;&nbsp;address: 为管理功能绑定的ip和端口号<br>
  &nbsp;&nbsp;auth: admin 为用户名，123456 为密码 （支持配置多个用户）

## 案例

### 企业实现统一科学上网

前提：

需要评估代理服务器带宽是否充足，条件允许，大陆用户建议选用香港服务器，选择高带宽，或者直接使用流量计费模式以获得更好的体验。

环境：

* 一台服务器，可以是虚拟机，Linux 2.2.x 以上内核 配置 4CPU 512M 以上内存， 100M 以上网卡 <br> 
  (条件允许，建议使用更高配置，使用千兆网络)
* 下载 KungFu linux 版本，修改 config.json 文件，并启动（需要 root 权限）。
* 修改路由器（或者3层交换）添加静态路由表，路由设置参考 config.json 文件中的配置。
* 修改内网 DHCP 服务器，设置下发 DNS 为上述部署 KungFu 的服务。
* 内网电脑，重连网络，检查 DHCP 是否生效
* 网络测试，尝试 `ping google.com` 是否已通

如果看到返回是和 config.json 中配置的网段一致，表示配置正确。
```bash
~# ping google.com
PING google.com (10.172.0.21) 56(84) bytes of data.
64 bytes from google.com (10.172.0.21): icmp_seq=1 ttl=60 time=0.306 ms
64 bytes from google.com (10.172.0.21): icmp_seq=2 ttl=60 time=0.229 ms
64 bytes from google.com (10.172.0.21): icmp_seq=3 ttl=60 time=0.323 ms
64 bytes from google.com (10.172.0.21): icmp_seq=4 ttl=60 time=0.323 ms
64 bytes from google.com (10.172.0.21): icmp_seq=5 ttl=60 time=0.324 ms
^C
--- google.com ping statistics ---
5 packets transmitted, 5 received, 0% packet loss, time 4098ms
rtt min/avg/max/mdev = 0.229/0.301/0.324/0.036 ms


~# traceroute google.com
traceroute to google.com (10.172.0.21), 30 hops max, 60 byte packets
 1  192.168.8.1 (192.168.8.1)  6.753 ms  7.655 ms  8.602 ms
 2  192.168.4.10 (192.168.4.10)  0.177 ms  0.162 ms  0.147 ms
 3  google.com (10.172.0.21)  0.202 ms  0.217 ms  0.236 ms
```

> 后续配置：合理划分 vlan，添加服务负载。


### 梅林系统（路由器）实现科学上网

实验环境：

* 华硕 RT-AC68U
* 固件 Merlin 384.5

步骤：
* 启用 jffs 脚本
* 启用 tun 设备， 修改 `/jffs/scripts/init-start` 文件，添加一行 
  `/sbin/modprobe tun`
* 关闭内置的 DNS 服务，但保留 DHCP 修改 `/jffs/configs/dnsmasq.conf.add`，添加一行 
  `port=0`
* 挂载一个移动硬盘或者 U 盘
  KungFu Pro 使用了存储，默认的 jffs2 文件系统不支持
* 将 KungFu Pro 拷贝到挂载的存储里，修改配置文件，然后启动即可

> 后续：设置开机启动，修改 `/jffs/configs/post-mount` 添加启动 KungFu Pro 脚本（命令）


### 树莓派实现小型局域网科学上网

前提：

需要路由器支持添加静态路由表。基本上几十块钱的 TP-Link 路由器都支持。

安装步骤：

参考 “企业实现统一科学上网”，只需要下载 arm 平台的包即可。

## 故障排除

1. 网络故障，不通，建议 tcpdump 抓包看看，是否数据包已抵达 Kung Fu Pro 所在服务器。
1. 如何定位正在使用那个代理？<br>
   通过 dns 反查, 通过返回的 TXT 信息定位，到底走了哪个代理出去 <br>
   ```
  ~# dig -x 10.172.0.21

  ; <<>> DiG 9.11.3-1ubuntu1.2-Ubuntu <<>> -x 10.172.0.21
  ;; global options: +cmd
  ;; Got answer:
  ;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 60044
  ;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

  ;; QUESTION SECTION:
  ;21.0.172.10.in-addr.arpa.	IN	PTR

  ;; ANSWER SECTION:
  21.0.172.10.in-addr.arpa. 60	IN	PTR	google.com.

  ;; ADDITIONAL SECTION:
  google.com.		10	IN	TXT	"groupId:1, groupName:gfw, ruleId:1, ruleType:2, ruleValue:google, proxyId:4, proxyName:HkRackspaceSS"

  ;; Query time: 0 msec
  ;; SERVER: 10.172.0.1#53(10.172.0.1)
  ;; WHEN: Sat Dec 08 14:43:35 CST 2018
  ;; MSG SIZE  rcvd: 214
   ```

## 升级

> 这并不是一个完全免费的工具，但是试用版已满足大部分的用户需要。

**价格方案**

| &nbsp; | Beta 版 | Trial 版 | Standard 版 | Professional 版 |
|--------|--------|---------|------------|----------------|
| 规则数    | 30     | 5       | 200        | 99999999       |
| 价格     | 免费     | 免费      | ￥89/年      | ￥199/年         |

> 轻度使用 5 条规则基本够用 <br>
> Beta 版用于尝鲜，过期后降级为 Trail 版本，Beta 版授权码不定期放出

**如何购买？**

微信转账后请邮件发送你的 `serverId` 至邮箱： `support@kungfu-pro.tk` <br>
可能由于时差关系，大概会在 1、2天内收到 License 激活码。小众软件，请谅解。

邮件模板：

```md
serverId: 035aee8838c937f0b748ecc19239507f61ede3fa
购买版本：Standard
付款方式：微信扫码
付款时间：2018-12-25 23:00 (左右)
```

![](../static/weixin.png)

## 更新日志

下载：https://github.com/kungfu-pro/kungfu-pro-issues/releases

* **v0.0.8** <br>
  date: 2018-12-08 <br>
  稳定版，添加了自定义 hosts 功能


## License

Beta:
```plain
H4sIAAAAAAAA/wCgAV/+kD/DB12/kOn8X//b8b82kUaJmat5TDh5fGRSZuFg/OvNLL4gGT4IjyOZd6MTvARxPUCEnnHdg5rH8he/YuyfdasGKxRoWTWbKcQFdF5AcaxbsI0HmJBuaRWgTyb1ENAulQEPOEWN0HIMuxYtBR1hfTisR2yy6zKYZ6dwmOIQLe+nVExv6qelFw5TpeFiWr2xfEFTh70LmjYOsTtEcGumc0+tgt+faVca0vrcYPWYT5gqHaj0HNFLw4TESO766MeKJ6BUZ1zOl6sE6AeNrM6DBYD7l4e7foTF6SpG6o4k5NI+nx3aMYBU8j0rBqLUIUQR0L+R2YwdZdbORZFL4uPN54DxoBLM4+qncCmBwZ+5Hi3FoMlQXBCK4FtlbrhJhNJR/PyNzFji4OH0l04+jwXfNdxXoYqVJpNt1TeymUcVJ9ErPtF10eZ4LxZ9q98eju1YnFTKySSlCtku25FODLsPcOWF6oS0Yf+6OghHowFwQR5Sji+8jg++om9m+NC5j9cmH9XRAEl2jbGsGKvwyils1v5k/bctLqhuN5DixjQvQpABAAD//+Z1y5igAQAAX01ea
```

## 沟通

Telegram: https://t.me/joinchat/LavVxxNtwXdTz7m5M0_c1g
