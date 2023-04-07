
// 
// Errors.
// 

class ENSNoContentError extends Error {}
class UnsupportedContentTypeError extends Error {}
class IPFSTimeoutError extends Error {}
class IPNSTimeoutError extends Error {}



// 
// Error pages.
// 


const pageStyles = `
html {
  box-sizing: border-box;
  font-size: 16px;
}

body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

#error {
    text-align: left;
    width: 800px;
    margin: 0 auto;
    padding-top: 2rem;
}

#error h2 {
    margin-bottom: 0;
}

p {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}
`
const noContentForENSNamePage = ({ req, err, ensName }) => {
    return `
<!doctype html>
<html>
    <head>
        <title>${ensName}</title>
        <style>${pageStyles}</style>
    </head>
    <body>
        <div id="error">
            <small>Dappnet</small>
            <h2>There was no content found for ${ensName}</h2>
            <p>The content hash was empty.</p>
            <p>If you're the owner of this name, you can <a href="https://app.ens.domains/name/${ensName}">configure it here</a> on ENS.
        </div>
    </body>
</html>
`
}

const unsupportedContentPage = ({ req, err, ensName }) => {
    return `
<!doctype html>
<html>
    <head>
        <title>${ensName}</title>
        <style>${pageStyles}</style>
    </head>
    <body>
        <div id="error">
            <small>Dappnet</small>
            <h2>Couldn't load content for ${ensName}</h2>
            <p>This content type is not yet supported by Dappnet or couldn't be parsed.</p>
            <pre>${`${err.toString()}\nENS data:\n${JSON.stringify(req.ensData, null, 2)}\nIPNS data:\n${JSON.stringify(req.ipnsData, null, 2)}`}</pre>
        </div>
    </body>
</html>
`
}

const defaultErrorPage = ({ req, err, ensName }) => {
    return `
<!doctype html>
<html>
    <head>
        <title>${ensName}</title>
        <style>${pageStyles}</style>
    </head>
    <body>
        <div id="error">
            <small>Dappnet</small>
            <h2>There was an unexpected error while loading ${ensName}</h2>
            <pre>${`${err.toString()}\nENS data:\n${JSON.stringify(req.ensData, null, 2)}\nIPNS data:\n${JSON.stringify(req.ipnsData, null, 2)}`}</pre>
        </div>
    </body>
</html>
`
}

module.exports = {
    ENSNoContentError,
    UnsupportedContentTypeError,
    IPFSTimeoutError,
    IPNSTimeoutError,

    noContentForENSNamePage,
    unsupportedContentPage,
    defaultErrorPage,
}
