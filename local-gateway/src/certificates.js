const { KJUR } = require('jsrsasign')
const rs = require('jsrsasign')

let cache = {}


// Convert certExpiry to a time that resembles YYYYMMDDHHMMSSZ
// https://www.rfc-editor.org/rfc/rfc5280#section-4.1.2.5.1
const dateToGeneralizedTime = (date) => {
    const str = date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z').replace('T', '')
    return str
}

const dappnetCA = require('../dev-certificates/dappnet-ca.json')

function generateCertificate(domain) {
    if (cache[domain]) return cache[domain]
    
    // Generate a private key
    // ca.key
    const caprvpem = dappnetCA.prvkey
    const capubkey = dappnetCA.pubkey
    const cakey = new rs.RSAKey();
    cakey.readPKCS5PrvKeyHex(rs.pemtohex(caprvpem));


    // STEP1. generate a key pair
    let kp = rs.KEYUTIL.generateKeypair("RSA", "2048");
    // let kp = rs.KEYUTIL.generateKeypair("EC", "secp256r1");
    let prv = kp.prvKeyObj;
    let pub = kp.pubKeyObj;
    let prvpem = rs.KEYUTIL.getPEM(prv, "PKCS8PRV");
    let pubpem = rs.KEYUTIL.getPEM(pub, "PKCS8PUB");


    let csr = new KJUR.asn1.csr.CertificationRequest({
        subject: {
            str: `/C=US/O=Dappnet/CN=*.${domain}`
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


    certNotBefore = dateToGeneralizedTime(certNotBefore)
    certNotAfter = dateToGeneralizedTime(certNotAfter)


    let x509 = new rs.X509();
    x509.readCertPEM(dappnetCA.cert);
    authorityKeyIdentifier = x509.getExtAuthorityKeyIdentifier();
    // console.log(authorityKeyIdentifier)


    // STEP2. specify certificate parameters

    let cert = new rs.KJUR.asn1.x509.Certificate({
        version: 3,
        serial: { int: Math.round(Math.random()*100000000000) },
        issuer: { str: "/C=US/O=Dappnet CA/CN=Dappnet certificates" },
        notbefore: { str: certNotBefore },
        notafter: { str: certNotAfter },
        subject: { str: `/C=US/O=Dappnet/CN=*.${domain}` },
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
    console.log(certpem)

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



/*
#!/usr/bin/env bash

# Generates your own Certificate Authority for development.
# This script should be executed just once.

# Generate private key
openssl genrsa -out ca.key 2048

# Generate root certificate
openssl req -x509 -new -nodes -subj "/C=US/O=_Development CA/CN=Development certificates" -key ca.key -sha256 -days 3650 -out ca.crt

echo -e "\e[42mSuccess!\e[49m"
echo
echo "The following files have been written:"
echo -e "  - \e[93mca.crt\e[39m is the public certificate that should be imported in your browser"
echo -e "  - \e[93mca.key\e[39m is the private key that will be used by \e[93mcreate-certificate.sh\e[39m"
echo
echo "Next steps:"
echo -e "  - Import \e[93mca.crt\e[39m in your browser"
echo -e "  - run \e[93mcreate-certificate.sh example.com\e[39m"
*/

// function generateCertificateAuthority() {
// // openssl req -x509 -new -nodes -subj "//O=_Development CA/CN=Development certificates" -key ca.key -sha256 -days 3650 -out ca.crt
// //     C = US
// //     O = Dappnet CA
// //     CN = Dappnet Certificates

//     // STEP1. generate a key pair
//     let kp = rs.KEYUTIL.generateKeypair("RSA", "2048");
    
//     let prv = kp.prvKeyObj;
//     let pub = kp.pubKeyObj;
//     let prvpem = rs.KEYUTIL.getPEM(prv, "PKCS8PRV");
//     let pubpem = rs.KEYUTIL.getPEM(pub, "PKCS8PUB");

//     // The UTC time of when the cert expires.
//     const certExpiryDistance = 3650 * 24 * 60 * 60 * 1000; // 10 years
//     let certNotBefore = new Date(Date.now())
//     let certNotAfter = new Date(Date.now() + certExpiryDistance)
//     certNotBefore = dateToGeneralizedTime(certNotBefore)
//     certNotAfter = dateToGeneralizedTime(certNotAfter)

//     let cert = new rs.KJUR.asn1.x509.Certificate({
//         version: 3,
//         serial: { int: Math.round(Math.random() * 100000000000) },
//         // issuer: { str: "/C=US/O=Dappnet CA/CN=Dappnet certificates" },
//         notbefore: { str: certNotBefore },
//         notafter: { str: certNotAfter },
//         subject: { str: `/C=US/O=Local Development/CN=Dappnet Certificates` },
//         sbjpubkey: pub,
//         sbjprvkey: prv,
//         ext: [
//             authorityKeyIdentifier,
//             {
//                 extname: "basicConstraints",
//                 critical: false,
//                 cA: false,
//             },
//             { extname: "keyUsage", names: ["digitalSignature", "nonRepudiation", "keyEncipherment", "dataEncipherment"] },
//             // { extname: "extendedKeyUsage", array: ["serverAuth", "clientAuth"] },
//             // {
//             //     extname: "subjectAltName", // for IssuerAltName, "issuerAltName" shall be specified
//             //     array: [
//             //         { dns: domain },           // [2] dNSName
//             //         // { dns: `*.${domain}` },           // [2] dNSName
//             //     ]
//             // },
//         ],
//         sigalg: "SHA256withRSA",
//         cakey,
//     });
// }

module.exports = {
    generateCertificate,
    generateCertificateOpenSSL
}