tell application "Finder"
    set aliasFile to make new alias file ¬
        at folder (path to desktop folder) ¬
        to alias ("/Users/liamz/Documents/Projects/dappnet/macos-app-shortcuts/script.sh") with properties ¬
        {name:"Go go gadget hammer"}
end tell
