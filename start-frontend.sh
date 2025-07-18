#!/bin/bash

echo "Starting Frontend Applications"
echo "=================================="

# Start React Shell
echo "Starting React Shell (port 3001)..."
cd /home/amaan/Documents/flowbitai/react-shell
npm start > /tmp/react-shell.log 2>&1 &
SHELL_PID=$!

# Wait a moment
sleep 2

# Start Support App  
echo "🎫 Starting Support App (port 3002)..."
cd /home/amaan/Documents/flowbitai/support-app
npm start > /tmp/support-app.log 2>&1 &
SUPPORT_PID=$!

echo ""
echo "Frontend applications started!"
echo "   React Shell: http://localhost:3001"
echo "   Support App: http://localhost:3002"
echo ""
echo "Process IDs:"
echo "   React Shell PID: $SHELL_PID"
echo "   Support App PID: $SUPPORT_PID"
echo ""
echo "Logs:"
echo "   React Shell: tail -f /tmp/react-shell.log"
echo "   Support App: tail -f /tmp/support-app.log"
echo ""
echo "To stop:"
echo "   kill $SHELL_PID $SUPPORT_PID"

# Keep script running
echo "Press Ctrl+C to stop all services..."
trap "echo 'Stopping services...'; kill $SHELL_PID $SUPPORT_PID 2>/dev/null; exit" INT

# Wait for user interrupt
while true; do
    sleep 1
done
