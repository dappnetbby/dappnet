package lib

import (
	"fmt"
	"crypto/tls"
	"io"
	"net/http"
	"log"
)


type GatewayServer struct {
	srv *http.Server
	ensResolver *ENSResolver
	
	certificateCache map[string]*tls.Certificate
}

func NewGatewayServer(port uint) (*GatewayServer) {
	s := &GatewayServer{}
	s.ensResolver = NewENSResolver()
	s.certificateCache = make(map[string]*tls.Certificate)

	// Start the HTTPS server.
	s.srv = &http.Server{
		Addr: fmt.Sprintf(":%d", port),
		Handler: s,
		TLSConfig: &tls.Config{
			GetCertificate: func(info *tls.ClientHelloInfo) (*tls.Certificate, error) {
				// Get the host.
				host := info.ServerName
				
				// Check the cache.
				if cert, ok := s.certificateCache[host]; ok {
					return cert, nil
				}

				// Generate the certificate.
				certDER, privKey, err := GenerateCertificateForENS(host)
				if err != nil {
					log.Printf("Error generating certificate: %v\n", err)
					return nil, err
				}

				cert := tls.Certificate{
					Certificate: [][]byte{certDER},
					PrivateKey:  privKey,
				}

				// Cache the certificate.
				s.certificateCache[host] = &cert

				return &cert, nil
			},
		},
	}

	return s
}

func (s *GatewayServer) Start() (error) {
	// NOTE: `certFile, keyFile` are empty since we provide a `GetCertificate` function.
	return s.srv.ListenAndServeTLS("", "")
}

func (s *GatewayServer) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	// Get the hostname.
	hostname := req.Host

	// Construct the full URL that the user sees.
	humanURL := fmt.Sprintf("https://%s%s", hostname, req.URL.Path)
	logger.Printf("Request for %s\n", humanURL)

	// We've already generated the certifiate.
	// Now we want to resolve the hostname to its contenthash.
	contenthash := s.ensResolver.Resolve(hostname)
	logger.Printf("Resolved %s to %s\n", hostname, contenthash)

	// Now we want to forward the request to the gateway.
	client := &http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			logger.Printf("Redirecting to %s\n", req.URL)
			return http.ErrUseLastResponse
		},
	}

	ipfsHost := "http://0.0.0.0:8080"
	ipfsContenthashPath := contenthash
	gatewayPath := ipfsHost + ipfsContenthashPath + req.URL.Path

	logger.Printf("Forwarding request to %s\n", gatewayPath)

	// GET.
	httpReq, err := http.NewRequest("GET", gatewayPath, nil)
	if err != nil {
		logger.Printf("Error creating request: %v\n", err)
		return
	}

	// Copy headers.
	for key, values := range req.Header {
		for _, value := range values {
			httpReq.Header.Add(key, value)
		}
	}

	// Send the request.
	resp, err := client.Do(httpReq)
	defer resp.Body.Close()
	if err != nil {
		logger.Printf("Error sending request: %v\n", err)
		return
	}

	// Copy headers.
	for key, values := range resp.Header {
		for _, value := range values {
			res.Header().Add(key, value)
		}
	}

	// Copy status code.
	res.WriteHeader(resp.StatusCode)

	// Stream response body.
	io.Copy(res, resp.Body)
}