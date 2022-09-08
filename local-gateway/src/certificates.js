const { KJUR } = require('jsrsasign')
const rs = require('jsrsasign')

// sign by private key
// const domain = 'whatever.eth'

let cache = {}

function generateCertificate(domain) {
    if (cache[domain]) return cache[domain]
    
    // Generate a private key
    var caprvpem = (function () {/*
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA17Hz/be4UWSLy2Td+kjHxbxzFRvu7Duy3K8VX1txP/AzOivv
/uph7IHOz+ZRTDu2aW2B0sf/rRruxkhz6HTHiILTXOBv4Qoi8qzX1SoVE+tSnWWY
kGTWhrNMaYZa58MkAanq2rDG2JpH0skI2uTQfGFYPiXRvBOTmts/ORHaDY1QnAbz
H6H05+GLdCjhwJ8fJic/twVlEdiqVxTNpyT37gGmyuPOu2/YLASj2RPPlXH1RQn5
SoRS+JGWwCUnlHrJYCoJN+BIjs88BK5PczqSaiFcVUGwjSbYNGSKN+Zw4PV/3n4M
ZyD6JTU1uRDcSmCJefbxH06akkjQHdobrIk7cQIDAQABAoIBAFJm1IywPEU0AUgB
z9/HIDLFjL2av0sWf31ZkfOtDnXbwOZPVM9xIVnmOWkpVxOlmElsoXUyHNY3/NJZ
aZZ7zqKzQCYyQ+uYIMPPDmGMQyMp+pTQ9FjtfRtWsjF6N45k+YN9M5C6iizDu/6l
+LEPSyrJUZnkfty4KeK2MdAOptwX1a+xzkt63BUQ3Y/M36RTn4wkvOcmDVV7/JCS
DTjyizLhRlkoTuR2UTcXOUT8Zj2z4MwdvLQMKrIHk5rRq2EFbJBeNVePvsDK4wDE
iqMHR6B+///sZdiNdfDBlpmw47BdUjiIdFmZpL+G26qZ/TfjexJzhYxRXOECWfTw
xoJbAmUCgYEA+tCDQ2TPsoOUSrH/dsXy/09TPofwIuVRjtcZnsLD2j5C91nv9HOK
MLVzc16Uq+GbghbNuOcjZm3kp+ogk6cW9JDq4kT16FSeyKG3ybc4GdqxFUEUIPsI
l3mZ7w4w+tmO+DXsiLaeloTFMp4ze4jhARquyAGvBxEbKIRoJkc35BsCgYEA3CeQ
WE3iTn+x2Vj5YH8knZEHwJBc5jIeE7vKVLQkDTMejSSBNgAQtEKxIM/WNkzsVhSo
UepzT5kkE6wSmrWlYH5cLvpOpd+kOp8kFyrGyBywT5jPliAblt83nBnLPxFRiuF7
vJSA5Izho5w2fVCuGN7nELXp1l8WFjLkePUyX2MCgYAZhss1Ordgxb978q27Wt4m
Wd5xCMjJ5GjujrnOzKe+OIP8RK0FRhUUbAM6BLBA5g87qDJ71RpnPFv/Mvbp0CGn
9m/RY49be/FFHiBkaT9OclF/hkYULThsojWmfN1DSo0geex+5YcyboTbZ/p5Yi70
O9D6DiHQKE+JSiCHdMwdbQKBgQCxmKj00z9wm8pYz1G86lQbV9etG8gVWvCwcpkx
43ABxe8rZPtnGH5hLDu/gGoJu9wbRObTzhHfcGaOCA2qCEa0pLqwmvO/E75kG+T9
W2CoJZyFWXx8WsJm3wL5RkWTRuFE68jpw9KGjK+pUGcUiHUpUweLj3RnnqUumzd7
7DEKiQKBgQCgrBdVW/6qJDfa1whfiIXiI+YgWEh+jN0VEk8ZGEO77KSzNjlLUOfh
0kyRP5MMZPSng4hp+0YPcZXq5bTo0kdxL4CJBaS3UIp7gsNNJg3kFaTWdxY9O8Zr
TP9/9tOX8+9MUbjgtOoZjm+zB3vGCM+i5QGDW1PCByQOIFb6Ht0Gsw==
-----END RSA PRIVATE KEY-----

    */}).toString().match(/\/\*([^]*)\*\//)[1];


    const cakey = new rs.RSAKey();
    cakey.readPKCS5PrvKeyHex(rs.pemtohex(caprvpem));


    const capubkey = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA17Hz/be4UWSLy2Td+kjH
xbxzFRvu7Duy3K8VX1txP/AzOivv/uph7IHOz+ZRTDu2aW2B0sf/rRruxkhz6HTH
iILTXOBv4Qoi8qzX1SoVE+tSnWWYkGTWhrNMaYZa58MkAanq2rDG2JpH0skI2uTQ
fGFYPiXRvBOTmts/ORHaDY1QnAbzH6H05+GLdCjhwJ8fJic/twVlEdiqVxTNpyT3
7gGmyuPOu2/YLASj2RPPlXH1RQn5SoRS+JGWwCUnlHrJYCoJN+BIjs88BK5PczqS
aiFcVUGwjSbYNGSKN+Zw4PV/3n4MZyD6JTU1uRDcSmCJefbxH06akkjQHdobrIk7
cQIDAQAB
-----END PUBLIC KEY-----

    `

    // const prvkey = `
    // -----BEGIN RSA PRIVATE KEY-----
    // MIIEowIBAAKCAQEAvnpRCA+JqwNQ8rXECUbkqTA74/B4blrCvuo2fo9wTx/49qtf
    // xDh5rUG/QH4k7o+0NmG4kjHuC0Y36MmUopicmpYpwUnn2J4ycXh/vPyHUCAkmcEh
    // DAYtzPMze/4gvQPYcSzOyttHJeCWfP3XzLz0rj6oCvM540iPSiBFHMMCHtiexxcZ
    // UXmY4TEsjB8J3F2Ag6FZHgWM91n6iV/WnYpICSEnadTQYD2r12dX2zFZB/lq6tHW
    // VTyKJ15i3Vr675hdaPuelTIdwCh/n7PqZCglDUjxSRMHWnaBLJnysqxNI7c7ZoWU
    // +/7R+FTyzI9GaQ6Fyy2SZOQ8yAE4OhJtVIDDCQIDAQABAoIBAEwVi7yOiE0ZHAJ2
    // /IFAIiI6tBGOgmyCMHwWDgJrxU611LqjJbO5Y1EDjCN0v8fS+wcl7ZXn/8/dEoQX
    // 0RlJoHRXOwKMROHP/xI4Mb4JmPs2e6g27r5g0XamRpBmqCkYGiLK5Sc+g6LrnPD8
    // bHDJoWrgeDs3gI3689GGJlUgx/4NlHa+eDo0iFOOnG9Fhm7wcDcIkuE7eviCaJpF
    // qQAcf18zSWs6U1qBdB/sKjXqlswHyOHvyICsVRvmDaIdOhXuzCuTv6NNHWhr9qwI
    // OBFr+oGeeQjxOo7vFJpXhZof6PU8o8ZpxYHofOavVI1BYEghI1sqD/xZjEZbRejV
    // NwqoCSkCgYEA5w/Uvv+d+vwB5zkxjcy/yoMOOwGe/MWgsnjBkW/6HOLCx2mcmHpI
    // HC5+s4+mO74EXQOSGqWNwKuAUtpRtUsSQrzlNWNJIDRvEk8mitWKir0HU/FO8JOj
    // Y8ZOG7IkHtt8hfoIue/DyojvccUEMYHD1IukVI3b86WCGrCFuHdcB/8CgYEA0wkp
    // Ie0f6NeaGVGUGwb2dKmrQOhBIGEAo6Z44bTGfMAhYsXrIgscwAOoLQvzgp1tRVqo
    // F68+iyEf5pXkUwJgQfYd7dRu4V3dsnklk2jyGIcgq/9wCCU3kkRIb+7HFvAQX9hv
    // XHMHlR/UpHGq/GbReXHxnRDaAR8jDSV1UNzq9PcCgYACvxptRsaO9C3lnLVtFRD2
    // jEZAB03nfUXiuTK70tPrQfrEugmlelafFyJkagG01hZhMKis7mjX8HHvCi9Mc179
    // MhebYdm9q0HiutQfdFhYO9T5d3XTwD2B8xp8k8qAH2XEhetSonn2T1hhRtE88Wjt
    // ftduNd12cPIx9QUx4yFR6wKBgQCI+GEiC+2yCn2SAUjHYfWEMrtcHWJnyY3Iqbu7
    // gsFxJqKEoUDDj8LRPY5h7mfWVqcdZIHFHZDSbGVwG8ldtyUSqtMyEbcFvw6tT8P7
    // sRmwocOq3tev8bfnzznUrH27fYSjMK7WqjI5r7csJDp+J5293R6cetuD7tmpJq7G
    // FRzKcQKBgDUX+sRKwCLweXWf7SaoCFfunDOJbcBTe0bLWhKBCo7e26xFvXJiLQny
    // as4ivaQxA/9xCIYOG3SditJ7J6iwfad8DdzOne+/S/jlTEtiblM5lMQD0Df+mR0F
    // 2Kw9hsf/NHq3xx5sibfbmoX0NtM30A6lN67SGkOsBnz8lMkn4ozQ
    // -----END RSA PRIVATE KEY-----
    // `


    // # Create a certificate signing request
    // openssl req - new - subj "/C=US/O=Local Development/CN=*.$DOMAIN" - key "$DOMAIN.key" - out "$DOMAIN.csr"



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



    // STEP1. generate a key pair
    var kp = rs.KEYUTIL.generateKeypair("RSA", "2048");
    // var kp = rs.KEYUTIL.generateKeypair("EC", "secp256r1");
    var prv = kp.prvKeyObj;
    var pub = kp.pubKeyObj;
    var prvpem = rs.KEYUTIL.getPEM(prv, "PKCS8PRV");
    var pubpem = rs.KEYUTIL.getPEM(pub, "PKCS8PUB");


    let csr = new KJUR.asn1.csr.CertificationRequest({
        subject: {
            str: `/C=US/O=Local Development/CN=*.${domain}`
        },
        sigalg: "SHA256withRSA",
        sbjpubkey: pub,
        sbjprvkey: prv,

    });
    const csrSigned = csr.getPEM(); // signed with sbjprvkey automatically

    var x509 = new rs.X509();
    x509.readCertPEM(`
    -----BEGIN CERTIFICATE-----
MIIDdTCCAl2gAwIBAgIUSmu6CoAhVXkrNFmCOM4ti/fmW9MwDQYJKoZIhvcNAQEL
BQAwSjELMAkGA1UEBhMCVVMxGDAWBgNVBAoMD19EZXZlbG9wbWVudCBDQTEhMB8G
A1UEAwwYRGV2ZWxvcG1lbnQgY2VydGlmaWNhdGVzMB4XDTIyMDkwNTA2MDIyNVoX
DTMyMDkwMjA2MDIyNVowSjELMAkGA1UEBhMCVVMxGDAWBgNVBAoMD19EZXZlbG9w
bWVudCBDQTEhMB8GA1UEAwwYRGV2ZWxvcG1lbnQgY2VydGlmaWNhdGVzMIIBIjAN
BgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA17Hz/be4UWSLy2Td+kjHxbxzFRvu
7Duy3K8VX1txP/AzOivv/uph7IHOz+ZRTDu2aW2B0sf/rRruxkhz6HTHiILTXOBv
4Qoi8qzX1SoVE+tSnWWYkGTWhrNMaYZa58MkAanq2rDG2JpH0skI2uTQfGFYPiXR
vBOTmts/ORHaDY1QnAbzH6H05+GLdCjhwJ8fJic/twVlEdiqVxTNpyT37gGmyuPO
u2/YLASj2RPPlXH1RQn5SoRS+JGWwCUnlHrJYCoJN+BIjs88BK5PczqSaiFcVUGw
jSbYNGSKN+Zw4PV/3n4MZyD6JTU1uRDcSmCJefbxH06akkjQHdobrIk7cQIDAQAB
o1MwUTAdBgNVHQ4EFgQUKcX8QkSm3s35w/NNrwoQLqTju7UwHwYDVR0jBBgwFoAU
KcX8QkSm3s35w/NNrwoQLqTju7UwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0B
AQsFAAOCAQEAUSmp6gpy8tiKV2+/ax/Q6cI7i4aWvYDxIKP0EhN4AYHbYCfdThCv
LEveXh6z6yFvoDVMoYWZ85L6GnOz3wpe7myUvU8+ZUJVMpr9KQzqvHqPhsvo3832
T5/k8jt6lv0VsxiCojltC8cwkbhBzt6BNrW9DG9NWE4/F++KGQtezss6U7FTvqKj
MXl8XnC+IZVVHLDXQK+kp58twfomt3Q+IXJuItECZGfQGv8xTQEjNLSR7lTgPktO
hMdL2bUL9TE0BeVZahnyRKtrTtxSKwGTlIBDb7Xg5MFK0TkKJE7hOpipOFV2GgNY
ndkUFD+ToIwa+KmQb+LUMsBhQ9ZcYwYI+g==
-----END CERTIFICATE-----
    `);
    authorityKeyIdentifier = x509.getExtAuthorityKeyIdentifier();
    // console.log(authorityKeyIdentifier)


    // STEP2. specify certificate parameters
    var cert = new rs.KJUR.asn1.x509.Certificate({
        version: 3,
        serial: { int: Math.round(Math.random()*100000000000) },
        issuer: { str: "/C=US/O=_Development CA/CN=Development certificates" },
        notbefore: "201231235959Z",
        notafter: "221231235959Z",
        subject: { str: `/C=US/O=Local Development/CN=*.${domain}` },
        sbjpubkey: pub,
        sbjprvkey: prv,
        ext: [
            authorityKeyIdentifier,
            {
                extname: "basicConstraints",
                critical: false,
                cA: false,     // OPTION. "false" can also be specified.
                // pathLen: 2
            },
            { extname: "keyUsage", names: ["digitalSignature", "nonRepudiation", "keyEncipherment", "dataEncipherment"] },
            // { extname: "extendedKeyUsage", array: ["serverAuth", "clientAuth"] },
            {
                extname: "subjectAltName", // for IssuerAltName, "issuerAltName" shall be specified
                array: [
                    { dns: domain },           // [2] dNSName
                    // { dns: `*.${domain}` },           // [2] dNSName
                ]
            },
        ],
        sigalg: "SHA256withRSA",
        cakey,
    });

    
    const certpem = cert.getPEM()
    // console.log(certpem)

    let entry = { key: prvpem, cert: certpem }
    cache[domain] = entry
    
    return entry
}

// generateCertificate('test.eth')

function generateCertificateOpenSSL(serverName) {

    shell.config.execPath = shell.which('node').toString();
    console.log(shell.config.execPath)
    console.log(shell.ls())

    shell.cd(__dirname + '/../dev-certificates/');
    let cmd = shell.exec(`./create-certificate.sh "${serverName}"`, { silent: true })
    if (cmd.code == 0) {

        return {
            key: fs.readFileSync(__dirname + `/../dev-certificates/certs/${serverName}.key`, 'utf8'),
            cert: fs.readFileSync(__dirname + `/../dev-certificates/certs/${serverName}.crt`, 'utf8')
        }

    } else {
        throw new Error("couldn't dynamically create cert for domain - " + serverName)
    }
}

module.exports = {
    generateCertificate,
    generateCertificateOpenSSL
}