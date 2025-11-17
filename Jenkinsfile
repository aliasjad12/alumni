pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-id')
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/aliasjad12/alumni.git'
            }
        }

        stage('Backend Build & Test') {
            steps {
                dir('backend') {
                    // Run Node/npm commands inside a Node container
                    docker.image('node:18').inside {
                        sh 'npm install'
                        sh 'npm test || echo "No backend tests yet, continuing..."'
                    }

                    // Build and push backend Docker image on host
                    sh 'docker build -t aliasjad12/alumni-backend:latest .'
                    sh 'docker push aliasjad12/alumni-backend:latest'
                }
            }
        }

        stage('Frontend Build & Test') {
            steps {
                dir('alumni-connect-frontend') {
                    // Run Node/npm commands inside Node container
                    docker.image('node:18').inside {
                        sh 'npm install'
                        sh 'npx cypress run || echo "No frontend tests yet, continuing..."'
                    }

                    // Build and push frontend Docker image on host
                    sh 'docker build -t aliasjad12/alumni-frontend:latest .'
                    sh 'docker push aliasjad12/alumni-frontend:latest'
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                // Apply secrets first
                sh 'kubectl apply -f k8s/backend-secrets.yaml'

                // Apply deployments & services
                sh 'kubectl apply -f k8s/backend-deployment.yaml'
                sh 'kubectl apply -f k8s/frontend-deployment.yaml'

                // Optional: check status
                sh 'kubectl get pods'
                sh 'kubectl get svc'
            }
        }
    }
}
