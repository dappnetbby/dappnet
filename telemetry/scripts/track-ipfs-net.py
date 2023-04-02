import psutil

# Get the process ID of the binary you want to monitor
pid = 56304

# Get the network I/O counters for the process
io_counters = psutil.net_io_counters(pid)
print(io_counters)

# Print the number of bytes sent and received by the process
print(f"Bytes sent: {io_counters.bytes_sent}")
print(f"Bytes received: {io_counters.bytes_recv}")
