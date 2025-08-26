package storage

import (
	"fmt"
	"os"
)

type JSONFile struct {
	Dir string
}

func NewJSONFile(dir string) JSONFile {
	if err := os.MkdirAll(dir, 0755); err != nil {
		if !os.IsExist(err) {
			panic(err)
		}
	}
	return JSONFile{
		Dir: dir,
	}
}

func (j JSONFile) fullpath(path string) string {
	return fmt.Sprintf("%s/%s.json", j.Dir, path)
}

func (f JSONFile) Save(path string, data []byte) error {
	path = f.fullpath(path)
	return os.WriteFile(path, data, 0644)
}

func (f JSONFile) Load(path string) ([]byte, error) {
	path = f.fullpath(path)
	return os.ReadFile(path)
}

func (f JSONFile) Delete(path string) error {
	path = f.fullpath(path)
	return os.Remove(path)
}
