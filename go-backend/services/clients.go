
package services

import (
    "context"
    "bytes"
    "net/http"
)

var httpClient = &http.Client{Transport: otelhttp.NewTransport(http.DefaultTransport)}


import (
    "context"
    "bytes"
    otelhttp "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
    "net/http"
    "time"
    "io/ioutil"
    "fmt"
    "encoding/json"
)

var HTTPClient = &http.Client{Timeout: 10 * time.Second}

func CallPython(path string, payload interface{}, base string) (map[string]interface{}, error) {
    url := fmt.Sprintf("%s%s", base, path)
    b, _ := json.Marshal(payload)
    resp, err := HTTPClient.Post(url, "application/json", bytesReader(b))
    if err != nil { return nil, err }
    defer resp.Body.Close()
    rb, _ := ioutil.ReadAll(resp.Body)
    var out map[string]interface{}
    _ = json.Unmarshal(rb, &out)
    return out, nil
}

func CallTS(path string, payload interface{}, base string) (map[string]interface{}, error) {
    return CallPython(path, payload, base) // same logic
}

func bytesReader(b []byte) *bytes.Reader {
    return bytes.NewReader(b)
}


// GetJSONContext performs a POST with JSON and decodes the response into out using provided context.
func GetJSONContext(ctx context.Context, url string, payload interface{}, out interface{}) error {
    b, err := json.Marshal(payload)
    if err != nil { return err }
    req, err := http.NewRequest("POST", url, bytes.NewReader(b))
    if err != nil { return err }
    req = req.WithContext(ctx)
    req.Header.Set("Content-Type", "application/json")
    // use otelhttp transport if available in httpClient
    resp, err := httpClient.Do(req)
    if err != nil { return err }
    defer resp.Body.Close()
    if resp.StatusCode >= 400 { return fmt.Errorf("remote error: %d", resp.StatusCode) }
    dec := json.NewDecoder(resp.Body)
    return dec.Decode(out)
}
