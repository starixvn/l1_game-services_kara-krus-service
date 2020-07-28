docker image build --tag sedie/local:latest -f Dockerfile.minisedie .
docker run -p 8082:8082 -d sedie/local:latest -e "NODE_ENV=production" 
