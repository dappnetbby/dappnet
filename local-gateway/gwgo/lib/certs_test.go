package lib

import (
	"testing"
)

func TestGenerateCertificateForENS(t *testing.T) {
    name := "kwenta.eth"
	GenerateCertificateForENS(name)
	// t.ExpectEqual("0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", resolveENS(name))
}
