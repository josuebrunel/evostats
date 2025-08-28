package xenv

import "os"

const (
	AppAddrN     = "APP_ADDR"
	AppAddrV     = ":8080"
	AppCacheN    = "APP_CACHE_ADDR"
	AppCacheV    = "127.0.0.1:6379"
	AppCachePwdN = "APP_CACHE_PWD"
	AppCachePwdV = ""
	AppCacheTtlN = "APP_CACHE_TTL"
	AppCacheTtlV = "300"
)

var EnvDefault = map[string]string{
	AppAddrN:     AppAddrV,
	AppCacheN:    AppCacheV,
	AppCachePwdN: AppCachePwdV,
}

func GetOrDefault(key string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return EnvDefault[key]
}
