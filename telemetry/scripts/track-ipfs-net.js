import psList from 'ps-list'
// Get the process ID of the binary you want to monitor
const pid = 56304;

// Get the network I/O statistics for the process
psList().then(processes => {
    const process = processes.find(p => p.pid === pid);
    console.log(process)
    if (process && process.netio) {
        console.log(`Bytes sent: ${process.netio.bytesSent}`);
        console.log(`Bytes received: ${process.netio.bytesRecv}`);
    }
});