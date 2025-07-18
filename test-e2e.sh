#!/bin/bash

# FlowBit.ai E2E Test Runner
echo "FlowBit.ai E2E Test Suite"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker is running"
}

# Start services
start_services() {
    print_status "Starting FlowBit.ai services..."
    
    # Start services in detached mode
    docker compose up -d --build
    
    if [ $? -eq 0 ]; then
        print_success "Services started successfully"
    else
        print_error "Failed to start services"
        exit 1
    fi
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for React Shell (port 3001)
    print_status "Waiting for React Shell (port 3001)..."
    timeout 60 bash -c 'until curl -s http://localhost:3001 > /dev/null; do sleep 2; done'
    
    if [ $? -eq 0 ]; then
        print_success "React Shell is ready"
    else
        print_warning "React Shell may not be ready, continuing anyway..."
    fi
    
    # Wait for Support App (port 3002)
    print_status "Waiting for Support App (port 3002)..."
    timeout 60 bash -c 'until curl -s http://localhost:3002 > /dev/null; do sleep 2; done'
    
    if [ $? -eq 0 ]; then
        print_success "Support App is ready"
    else
        print_warning "Support App may not be ready, continuing anyway..."
    fi
    
    # Wait for API (port 3000)
    print_status "Waiting for API (port 3000)..."
    timeout 60 bash -c 'until curl -s http://localhost:3000 > /dev/null; do sleep 2; done'
    
    if [ $? -eq 0 ]; then
        print_success "API is ready"
    else
        print_warning "API may not be ready, continuing anyway..."
    fi
    
    # Additional wait to ensure all services are fully initialized
    print_status "Giving services additional time to initialize..."
    sleep 10
}

# Run Cypress tests
run_cypress_tests() {
    print_status "Running Cypress E2E tests..."
    
    # Check if we should run in headed mode
    if [ "$1" = "--headed" ]; then
        print_status "Running tests in headed mode..."
        npm run test:e2e:headed
    else
        print_status "Running tests in headless mode..."
        npm run test:e2e
    fi
    
    if [ $? -eq 0 ]; then
        print_success "All E2E tests passed!"
        return 0
    else
        print_error "Some E2E tests failed!"
        return 1
    fi
}

# Run smoke tests only
run_smoke_tests() {
    print_status "Running smoke tests..."
    
    npm run test:smoke
    
    if [ $? -eq 0 ]; then
        print_success "Smoke tests passed!"
        return 0
    else
        print_error "Smoke tests failed!"
        return 1
    fi
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    docker compose down
    print_success "Services stopped"
}

# Main execution
main() {
    print_status "Starting FlowBit.ai E2E Test Suite..."
    
    # Set up trap to cleanup on exit
    trap cleanup EXIT
    
    # Check prerequisites
    check_docker
    
    # Start services
    start_services
    
    # Wait for services to be ready
    wait_for_services
    
    # Run tests based on arguments
    case "$1" in
        "--smoke")
            run_smoke_tests
            ;;
        "--headed")
            run_cypress_tests --headed
            ;;
        "--help")
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --smoke    Run smoke tests only"
            echo "  --headed   Run tests in headed mode (visible browser)"
            echo "  --help     Show this help message"
            echo ""
            echo "Default: Run all E2E tests in headless mode"
            ;;
        *)
            run_cypress_tests
            ;;
    esac
    
    test_result=$?
    
    # Show service logs if tests failed
    if [ $test_result -ne 0 ]; then
        print_warning "Tests failed. Showing service logs..."
        echo ""
        echo "=== React Shell Logs ==="
        docker compose logs react-shell | tail -20
        echo ""
        echo "=== Support App Logs ==="
        docker compose logs support-app | tail -20
        echo ""
        echo "=== API Logs ==="
        docker compose logs api | tail -20
    fi
    
    return $test_result
}

# Run main function with all arguments
main "$@"
exit_code=$?

# Final status
if [ $exit_code -eq 0 ]; then
    print_success "All tests completed successfully!"
else
    print_error "Some tests failed. Check the output above for details."
fi

exit $exit_code
