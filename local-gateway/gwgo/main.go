package main

import (
	"log"
	lib "github.com/dappnetbby/local-gateway/lib"
	"github.com/akamensky/argparse"
	"os"
	"fmt"
)

var logger = log.New(os.Stdout, "", log.Ldate|log.Ltime)
const VERSION = "0.0.1"
const GATEWAY_PORT = 10424

func main() {
	parser := argparse.NewParser("print", "Prints provided string to stdout")
	// caDataPath := parser.String("ca-data-path", "string", &argparse.Options{Required: true, Help: "The path to Dappnet's self-signed certificate authority data"})

	// Parse input
	err := parser.Parse(os.Args)
	if err != nil {
		fmt.Print(parser.Usage(err))
	}

    logger.Printf("Dappnet Local Gateway v%s\n", VERSION)
	logger.Println("Copyright Liam Zebedee and contributors")

	gateway := lib.NewGatewayServer(GATEWAY_PORT)
	
	go func(){
		logger.Println("")
		logger.Printf("Listening on http://0.0.0.0:%d\n", GATEWAY_PORT)
		if err := gateway.Start(); err != nil {
            logger.Printf("Error starting server: %v\n", err)
        }
	}()

	ch := make(chan bool)
	<-ch
}