package xenv

import "os"

const (
	AppAddrN     = "APP_ADDR"
	AppAddrV     = ":8080"
	AppRedisN    = "APP_REDIS_ADDR"
	AppRedisV    = "127.0.0.1:6379"
	AppRedisPwdN = "APP_REDIS_PWD"
	AppRedisPwdV = ""
	AppRedisTtlN = "APP_REDIS_TTL"
	AppRedisTtlV = "60"
)

var EnvDefault = map[string]string{
	AppAddrN:     AppAddrV,
	AppRedisN:    AppRedisV,
	AppRedisPwdN: AppRedisPwdV,
}

func GetOrDefault(key string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return EnvDefault[key]
}
