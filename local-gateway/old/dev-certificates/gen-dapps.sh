cat dapps | while read dapp
do
    ./create-certificate.sh $dapp
    mv $dapp.crt $dapp.key ../proxy/certs
done
