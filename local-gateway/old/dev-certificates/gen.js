const { KJUR } = require('jsrsasign')
const rs = require('jsrsasign')

// sign by private key
const domain = 'whatever.eth'

// # Generate a private key
// openssl genrsa - out "$DOMAIN.key" 2048


// var rs = require('../lib/jsrsasign.js');

// // z1.pkcs1.pem
// var _Z1PKCS1PEM = (function () {/*
// -----BEGIN RSA PRIVATE KEY-----
// MIIEowIBAAKCAQEAt+KqldhD0TunqVN0yqR64JXJ6AMQewJj2iaeEbO0D4QVJhI4
// j8bbjhYHraMBEM5q2VDgCgXIcg+XB/u0vqsawfbGPbb+HBypRq1kp57JGSHqmqg2
// iQ+5GwksAnV2DtVpV3MW5w7ZyHJhbfpf6AQrI9pS4aHVcDyVk//WqNqnjDbvS6U3
// M56ELeEefPqJhnR5xhXDEVwLCGMXxBbc4epPAsou3x6jWt4suWVWeJrsoB1zG7qN
// HuDB/I9rokd0k6+kYh8lhY7c4sthjqbtioPJ8G8OPWSXtPCNDWzgyjt++cSxeept
// x9Z6r6VHfbVx7NifEV4sgkq8SXns8zBSkTgO5wIDAQABAoIBAG/QoeAKKHrTZokd
// GVibmah1DNhK/Lt/4Y3mi5nCB0ykCWQkEkbDKgCFPtgD1YMNsYVBm2ocyB0rg7A0
// C10hmFy3nSYr3urjNr+mch1G/YuNxyWSAc9oQyvAcQVxvX8ZoDuv3Q5VRnKPstT4
// OVdRKZZcjKdtC+d6v43GNRZqFxW3zV3qYqJZ24XDI8x0n0JhRWw3wzZDsaxhewxo
// NJwwDdi5vv9CifTOFzhhim80B4zC7ky4YP/kYla6TUruG2fBEpwiVImmQdaM/T88
// MnLzHT+Fo/nw7Y3jhKAmOVM0YRsHwS1ntmJ1NTNDQkyBZrbbc1aFOe1pvvPmAkjn
// m24m98kCgYEA6H0HFuNdIMKv2/W5AarXN+b8OOeg6XHjF6wIjcT/i4jJlXSn8nYG
// PzigBof2Ri2LWk4qodzBKF4s+BbSvLrYubeEc2rnGVSiH49ZybTq4y8/5p6py7cI
// EpwLBFRCOYfq2Vf4m/xJYkQVkW24yJpVhYwPmezBPyl9RYcX+8yry6MCgYEAyntW
// 5o0c0VdMt/Q1pE83RbQT2GgC9sdBssa6ManDi5b9XqzoyPZQ9fkf5bPlQDSkE7r1
// 5pEsgRdmns70vQ0iNzMlMPoTEOnbgP0nI1a6O9+//ezM4IR4PhX23HVE3BIFCZU9
// 82q4LtE/zOG67Icd2dPhfCdyJFEAcwkg84ap4+0CgYBcTBaebZExSllKt9jE4rAi
// j18esEZfp0kCwtd6gPT6zklJPlDWnyiHvNE7Boss/TPPnCysqdk9T3YG3/i12G/l
// +wdoUs6AbesXIHAC9gIyQzXZNrAuIfHggXaWN2U7Ncx0kMowEw6HJoRxgd/UNAEz
// zZD8CNQHYU9MZP+OhYjGhQKBgQCU/SKZbJYa17Dk3rYl3AAgsvuzTf14Vm/aO25A
// Itl3OjffVT3Iua4jABffbnquvs1Ik1ZjPMlRh8WD72aYQTS/B0xDeI9U768Lf7sv
// vp40dlSQZJDwV6kejgzidQuhH0VDouQ923YBRQk8GZDwgA+P+987+s57OHsrKjlr
// 19fklQKBgHiXByuJ8vg1pjdMbBlB+HGsU4NWYIBgIEYp0I/eA6uqibvVNMaM3Vs/
// lekj44Y6MIiE6yDwmC99Ozjj8X0+u+lmn8QvnYfBMMMmMvo9AhpfiZiLpaEdvRYn
// dX35ZznBjCzFGsSojUdcZ6ZS0zz40wUZA2B8pzGgpiOEsMDjt9H9
// -----END RSA PRIVATE KEY-----
// */}).toString().match(/\/\*([^]*)\*\//)[1];


// var prv = new rs.RSAKey();
// prv.readPKCS5PrvKeyHex(rs.pemtohex(_Z1PKCS1PEM));


const pubkey = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvnpRCA+JqwNQ8rXECUbk
qTA74/B4blrCvuo2fo9wTx/49qtfxDh5rUG/QH4k7o+0NmG4kjHuC0Y36MmUopic
mpYpwUnn2J4ycXh/vPyHUCAkmcEhDAYtzPMze/4gvQPYcSzOyttHJeCWfP3XzLz0
rj6oCvM540iPSiBFHMMCHtiexxcZUXmY4TEsjB8J3F2Ag6FZHgWM91n6iV/WnYpI
CSEnadTQYD2r12dX2zFZB/lq6tHWVTyKJ15i3Vr675hdaPuelTIdwCh/n7PqZCgl
DUjxSRMHWnaBLJnysqxNI7c7ZoWU+/7R+FTyzI9GaQ6Fyy2SZOQ8yAE4OhJtVIDD
CQIDAQAB
-----END PUBLIC KEY-----
`

const prvkey = `
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAvnpRCA+JqwNQ8rXECUbkqTA74/B4blrCvuo2fo9wTx/49qtf
xDh5rUG/QH4k7o+0NmG4kjHuC0Y36MmUopicmpYpwUnn2J4ycXh/vPyHUCAkmcEh
DAYtzPMze/4gvQPYcSzOyttHJeCWfP3XzLz0rj6oCvM540iPSiBFHMMCHtiexxcZ
UXmY4TEsjB8J3F2Ag6FZHgWM91n6iV/WnYpICSEnadTQYD2r12dX2zFZB/lq6tHW
VTyKJ15i3Vr675hdaPuelTIdwCh/n7PqZCglDUjxSRMHWnaBLJnysqxNI7c7ZoWU
+/7R+FTyzI9GaQ6Fyy2SZOQ8yAE4OhJtVIDDCQIDAQABAoIBAEwVi7yOiE0ZHAJ2
/IFAIiI6tBGOgmyCMHwWDgJrxU611LqjJbO5Y1EDjCN0v8fS+wcl7ZXn/8/dEoQX
0RlJoHRXOwKMROHP/xI4Mb4JmPs2e6g27r5g0XamRpBmqCkYGiLK5Sc+g6LrnPD8
bHDJoWrgeDs3gI3689GGJlUgx/4NlHa+eDo0iFOOnG9Fhm7wcDcIkuE7eviCaJpF
qQAcf18zSWs6U1qBdB/sKjXqlswHyOHvyICsVRvmDaIdOhXuzCuTv6NNHWhr9qwI
OBFr+oGeeQjxOo7vFJpXhZof6PU8o8ZpxYHofOavVI1BYEghI1sqD/xZjEZbRejV
NwqoCSkCgYEA5w/Uvv+d+vwB5zkxjcy/yoMOOwGe/MWgsnjBkW/6HOLCx2mcmHpI
HC5+s4+mO74EXQOSGqWNwKuAUtpRtUsSQrzlNWNJIDRvEk8mitWKir0HU/FO8JOj
Y8ZOG7IkHtt8hfoIue/DyojvccUEMYHD1IukVI3b86WCGrCFuHdcB/8CgYEA0wkp
Ie0f6NeaGVGUGwb2dKmrQOhBIGEAo6Z44bTGfMAhYsXrIgscwAOoLQvzgp1tRVqo
F68+iyEf5pXkUwJgQfYd7dRu4V3dsnklk2jyGIcgq/9wCCU3kkRIb+7HFvAQX9hv
XHMHlR/UpHGq/GbReXHxnRDaAR8jDSV1UNzq9PcCgYACvxptRsaO9C3lnLVtFRD2
jEZAB03nfUXiuTK70tPrQfrEugmlelafFyJkagG01hZhMKis7mjX8HHvCi9Mc179
MhebYdm9q0HiutQfdFhYO9T5d3XTwD2B8xp8k8qAH2XEhetSonn2T1hhRtE88Wjt
ftduNd12cPIx9QUx4yFR6wKBgQCI+GEiC+2yCn2SAUjHYfWEMrtcHWJnyY3Iqbu7
gsFxJqKEoUDDj8LRPY5h7mfWVqcdZIHFHZDSbGVwG8ldtyUSqtMyEbcFvw6tT8P7
sRmwocOq3tev8bfnzznUrH27fYSjMK7WqjI5r7csJDp+J5293R6cetuD7tmpJq7G
FRzKcQKBgDUX+sRKwCLweXWf7SaoCFfunDOJbcBTe0bLWhKBCo7e26xFvXJiLQny
as4ivaQxA/9xCIYOG3SditJ7J6iwfad8DdzOne+/S/jlTEtiblM5lMQD0Df+mR0F
2Kw9hsf/NHq3xx5sibfbmoX0NtM30A6lN67SGkOsBnz8lMkn4ozQ
-----END RSA PRIVATE KEY-----
`


// # Create a certificate signing request
// openssl req - new - subj "/C=US/O=Local Development/CN=*.$DOMAIN" - key "$DOMAIN.key" - out "$DOMAIN.csr"


let csr = new KJUR.asn1.csr.CertificationRequest({
    subject: { 
        str: `/C=US/O=Local Development/CN=*.${domain}` 
    },
    sbjpubkey: pubkey,
    // extreq: [{ extname: "subjectAltName", array: [{ dns: "example.com" }] }],
    sigalg: "SHA256withRSA",
    sbjprvkey: prvkey
});
const csrSigned = csr.getPEM(); // signed with sbjprvkey automatically

// console.log(csrSigned)


// # Create a config file for the extensions

// # Create the signed certificate
// openssl x509 - req \
// -in "$DOMAIN.csr" \
// -extfile "$DOMAIN.ext" \
// -CA ca.crt \
// -CAkey ca.key \
// -CAcreateserial \
// -out "$DOMAIN.crt" \
// -days 365 \
// -sha256


// STEP2. specify certificate parameters
var cert = new rs.KJUR.asn1.x509.Certificate({
    version: 3,
    serial: { int: 4 },
    issuer: { str: "/CN=UserCA" },
    notbefore: "201231235959Z",
    notafter: "221231235959Z",
    subject: { str: `/C=US/O=Local Development/CN=*.${domain}` },
    sbjpubkey: pubkey,
    ext: [
        // { extname: "authorityKeyIdentifier", kid: pubkey, issuer: csrSigned  },
        {
            extname: "basicConstraints",
            critical: false,
            cA: true,     // OPTION. "false" can also be specified.
            pathLen: 2
        },
        { extname: "keyUsage", names: ["digitalSignature", "nonRepudiation", "keyEncipherment", "dataEncipherment"] },
        {
            extname: "subjectAltName", // for IssuerAltName, "issuerAltName" shall be specified
            array: [
                { dns: domain },           // [2] dNSName
                { dns: `*.${domain}` },           // [2] dNSName
            ]
        },
    ],
    sigalg: "SHA256withRSA",
    cakey: prvkey
});

console.log(cert.getPEM())