# Options:
# -p: select ipfs process
# -L: display only 1 sample. Output as CSV.
# -c: less intensive use of CPU
# -P: do not output connections, only process info (summary view)
nettop -P -p $(pgrep ipfs) -L 1 -c > out
