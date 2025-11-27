package utils

import (
    "io/ioutil"
)

func SaveFile(path string, data []byte) error {
    return ioutil.WriteFile(path, data, 0644)
}

func ReadFile(path string) ([]byte, error) {
    return ioutil.ReadFile(path)
}

func Exists(path string) bool {
    _, err := os.Stat(path)
    return err == nil
}
