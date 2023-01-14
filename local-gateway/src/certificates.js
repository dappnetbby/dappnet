const { KJUR } = require('jsrsasign')
const rs = require('jsrsasign')

let cache = {}

function generateCertificate(domain) {
    if (cache[domain]) return cache[domain]
    
    // Generate a private key
    let caprvpem = (function () {/*
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


    // STEP1. generate a key pair
    let kp = rs.KEYUTIL.generateKeypair("RSA", "2048");
    // let kp = rs.KEYUTIL.generateKeypair("EC", "secp256r1");
    let prv = kp.prvKeyObj;
    let pub = kp.pubKeyObj;
    let prvpem = rs.KEYUTIL.getPEM(prv, "PKCS8PRV");
    let pubpem = rs.KEYUTIL.getPEM(pub, "PKCS8PUB");


    let csr = new KJUR.asn1.csr.CertificationRequest({
        subject: {
            str: `/C=US/O=Local Development/CN=*.${domain}`
        },
        sigalg: "SHA256withRSA",
        sbjpubkey: pub,
        sbjprvkey: prv,

    });
    const csrSigned = csr.getPEM(); // signed with sbjprvkey automatically

    // The UTC time of when the cert expires.
    const certExpiryDistance = 365 * 24 * 60 * 60 * 1000; // 1 year
    let certNotBefore = new Date(Date.now())
    let certNotAfter = new Date(Date.now() + certExpiryDistance)

    // Convert certExpiry to a time that resembles YYYYMMDDHHMMSSZ
    // https://www.rfc-editor.org/rfc/rfc5280#section-4.1.2.5.1
    const dateToGeneralizedTime = (date) => {
        const str = date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z').replace('T', '')
        return str
    }

    certNotBefore = dateToGeneralizedTime(certNotBefore)
    certNotAfter = dateToGeneralizedTime(certNotAfter)


    let x509 = new rs.X509();
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

    let cert = new rs.KJUR.asn1.x509.Certificate({
        version: 3,
        serial: { int: Math.round(Math.random()*100000000000) },
        issuer: { str: "/C=US/O=_Development CA/CN=Development certificates" },
        notbefore: { str: certNotBefore },
        notafter: { str: certNotAfter },
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