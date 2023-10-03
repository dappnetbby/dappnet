package lib

import (
	"crypto/x509"
	"crypto/rand"
	"crypto/x509/pkix"
	"crypto/rsa"
	"encoding/pem"
	"fmt"
	"math/big"
	"io/ioutil"
	// "log"
	"os"
	// "fmt"
	"time"
)

// The directory to location of the Dappnet CA files.
const DAPPNET_CA_DIR = "/Users/liamz/Library/Application Support/Dappnet/data"

func getDappnetCA() (*rsa.PrivateKey, *rsa.PublicKey) {
	// Private key.
	// 
	privateKeyPEM, err := ioutil.ReadFile(DAPPNET_CA_DIR + "/ca.key")
	if err != nil {
		fmt.Printf("Error reading CA private key: %v\n", err)
		return nil, nil
	}

	block, _ := pem.Decode(privateKeyPEM)
	if block == nil {
		fmt.Println("Error decoding PEM block")
		return nil, nil
	}

	privateKey, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		fmt.Printf("Error parsing RSA private key: %v\n", err)
		return nil, nil
	}

	// Private key.
	// 
	publicKeyPEM, err := ioutil.ReadFile(DAPPNET_CA_DIR + "/ca.pubkey")
	if err != nil {
		fmt.Printf("Error reading CA public key: %v\n", err)
		return nil, nil
	}

	block, _ = pem.Decode(publicKeyPEM)
	if block == nil {
		fmt.Println("Error decoding PEM block")
		return nil, nil
	}

	publicKey, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		fmt.Printf("Error parsing CA public key: %v\n", err)
		return nil, nil
	}

	// TODO: will use for validating later.
	// switch publicKey.(type) {
	// case *rsa.PublicKey:
	// 	// fmt.Println("pub is of type RSA:", pub)
	// // case *dsa.PublicKey:
	// // 	fmt.Println("pub is of type DSA:", pub)
	// // case *ecdsa.PublicKey:
	// // 	fmt.Println("pub is of type ECDSA:", pub)
	// // case ed25519.PublicKey:
	// // 	fmt.Println("pub is of type Ed25519:", pub)
	// default:
	// 	panic("unknown type of public key")
	// }

	return privateKey, publicKey.(*rsa.PublicKey)
}

func GenerateCertificateForENS(ensDomain string) ([]byte, *rsa.PrivateKey, error) {
	serverPrivateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		fmt.Printf("Error generating RSA key pair: %v\n", err)
		return []byte{}, nil, nil
	}

	// Generate a self-signed certificate
	serialNumber, err := rand.Int(rand.Reader, big.NewInt(100000000000))
	if err != nil {
		fmt.Printf("Error generating serial number: %v\n", err)
		return []byte{}, nil, err
	}

	notBefore := time.Now()
	notAfter := notBefore.Add(365 * 24 * time.Hour) // Valid for 1 year

	template := x509.Certificate{
		SerialNumber: serialNumber,
		Subject: pkix.Name{
			Country:      []string{"US"},
			Organization: []string{"Dappnet"},
			CommonName:   "*." + ensDomain,
		},
		Issuer: pkix.Name{
			Country:      []string{"US"},
			Organization: []string{"Dappnet CA"},
			CommonName:   "Dappnet certificates",
		},
		NotBefore:             notBefore,
		NotAfter:              notAfter,
		KeyUsage:              x509.KeyUsageKeyEncipherment | x509.KeyUsageDigitalSignature,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth, x509.ExtKeyUsageClientAuth},
		BasicConstraintsValid: false,
	}

	// Add Subject Alternative Names (SANs)
	template.DNSNames = append(template.DNSNames, ensDomain)

	// Create a self-signed certificate using the CSR and private key
	caPrivateKey, _ := getDappnetCA()

	// Load the CA certificate from the file
    caCertFile, err := os.ReadFile(DAPPNET_CA_DIR + "/ca.crt")
    if err != nil {
        panic(err)
    }

    // Parse the CA certificate PEM block
    block, _ := pem.Decode(caCertFile)
    if block == nil {
        panic("Failed to decode PEM block from CA certificate")
    }

    // Parse the CA certificate
    caTemplate, err := x509.ParseCertificate(block.Bytes)
    if err != nil {
        panic(err)
    }
	fmt.Printf("CA Common Name: %s\n", caTemplate.Subject.CommonName)
    fmt.Printf("CA Serial Number: %s\n", caTemplate.SerialNumber)
    fmt.Printf("CA Valid From: %s\n", caTemplate.NotBefore)
    fmt.Printf("CA Valid To: %s\n", caTemplate.NotAfter)
    fmt.Printf("Is CA: %v\n", caTemplate.IsCA)
    fmt.Printf("Key Usage: %v\n", caTemplate.KeyUsage)
    fmt.Printf("Basic Constraints Valid: %v\n", caTemplate.BasicConstraintsValid)

	serverDER, err := x509.CreateCertificate(rand.Reader, &template, caTemplate, &serverPrivateKey.PublicKey, caPrivateKey)
	if err != nil {
		fmt.Printf("Error creating self-signed certificate: %v\n", err)
		return []byte{}, nil, err
	}

	// certPEM := pem.EncodeToMemory(&pem.Block{
	// 	Type: "CERTIFICATE", Bytes: serverDER,
	// })

	// Dump this to a file for testing.
	// err = ioutil.WriteFile("cert.pem", certPEM, 0644)

	return serverDER, serverPrivateKey, nil
}