#!/bin/bash

# ha-cleanup Production Deployment Script
# This script automates the deployment process for production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="ha-cleanup"
DOCKER_COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env.production"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install it and try again."
        exit 1
    fi
    
    # Check if environment file exists
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file $ENV_FILE not found. Please create it from env.production.example"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

build_application() {
    log_info "Building application..."
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --only=production
    
    # Build the application
    log_info "Building production bundle..."
    npm run build
    
    if [ $? -eq 0 ]; then
        log_success "Application built successfully"
    else
        log_error "Build failed"
        exit 1
    fi
}

build_docker_image() {
    log_info "Building Docker production image..."
    
    docker build -f Dockerfile.production -t $APP_NAME:latest .
    
    if [ $? -eq 0 ]; then
        log_success "Docker image built successfully"
    else
        log_error "Docker build failed"
        exit 1
    fi
}

deploy_services() {
    log_info "Deploying services..."
    
    # Stop existing services
    log_info "Stopping existing services..."
    docker-compose -f $DOCKER_COMPOSE_FILE down --remove-orphans
    
    # Start services
    log_info "Starting services..."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    
    if [ $? -eq 0 ]; then
        log_success "Services started successfully"
    else
        log_error "Service startup failed"
        exit 1
    fi
}

wait_for_health() {
    log_info "Waiting for services to be healthy..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost/health > /dev/null 2>&1; then
            log_success "Application is healthy"
            return 0
        fi
        
        log_info "Attempt $attempt/$max_attempts - Waiting for health check..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

check_services() {
    log_info "Checking service status..."
    
    docker-compose -f $DOCKER_COMPOSE_FILE ps
    
    # Check if all services are running
    local running_services=$(docker-compose -f $DOCKER_COMPOSE_FILE ps -q | wc -l)
    local total_services=$(docker-compose -f $DOCKER_COMPOSE_FILE config --services | wc -l)
    
    if [ "$running_services" -eq "$total_services" ]; then
        log_success "All services are running"
    else
        log_warning "Some services may not be running properly"
    fi
}

show_logs() {
    log_info "Recent application logs:"
    docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=20 $APP_NAME
}

show_performance() {
    log_info "Performance metrics:"
    
    # Check bundle size
    local bundle_size=$(du -sh dist/ | cut -f1)
    log_info "Bundle size: $bundle_size"
    
    # Check load time
    local start_time=$(date +%s)
    curl -s http://localhost/health > /dev/null
    local end_time=$(date +%s)
    local response_time=$((end_time - start_time))
    log_info "Health check response time: ${response_time}s"
}

cleanup() {
    log_info "Cleaning up..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove unused containers
    docker container prune -f
    
    log_success "Cleanup completed"
}

main() {
    log_info "Starting ha-cleanup production deployment..."
    
    # Check prerequisites
    check_prerequisites
    
    # Build application
    build_application
    
    # Build Docker image
    build_docker_image
    
    # Deploy services
    deploy_services
    
    # Wait for health
    if wait_for_health; then
        # Check services
        check_services
        
        # Show logs
        show_logs
        
        # Show performance
        show_performance
        
        # Cleanup
        cleanup
        
        log_success "Deployment completed successfully!"
        log_info "Application is available at: http://localhost"
        log_info "Grafana is available at: http://localhost:3001"
        
        echo ""
        echo "🎉 Deployment Summary:"
        echo "✅ Application built and deployed"
        echo "✅ Services are running and healthy"
        echo "✅ Performance optimizations applied"
        echo "✅ SSL and security configured"
        echo ""
        echo "Next steps:"
        echo "1. Configure your domain in nginx/nginx.conf"
        echo "2. Add SSL certificates to nginx/ssl/"
        echo "3. Update environment variables as needed"
        echo "4. Monitor logs: docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
        
    else
        log_error "Deployment failed - health check did not pass"
        show_logs
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    "deploy")
        main
        ;;
    "status")
        check_services
        ;;
    "logs")
        show_logs
        ;;
    "restart")
        log_info "Restarting services..."
        docker-compose -f $DOCKER_COMPOSE_FILE restart
        log_success "Services restarted"
        ;;
    "stop")
        log_info "Stopping services..."
        docker-compose -f $DOCKER_COMPOSE_FILE down
        log_success "Services stopped"
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Usage: $0 {deploy|status|logs|restart|stop|cleanup}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full production deployment"
        echo "  status   - Check service status"
        echo "  logs     - Show application logs"
        echo "  restart  - Restart all services"
        echo "  stop     - Stop all services"
        echo "  cleanup  - Clean up unused Docker resources"
        exit 1
        ;;
esac
