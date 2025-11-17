pipeline {
    agent any
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-id') 
    }
    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/aliasjad12/alumni.git'
            }
        }
        stage('Backend Build & Test') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'npm test'                 // Run Jest tests
                    sh 'docker build -t aliasjad12/alumni-backend:latest .'
                    sh 'docker push aliasjad12/alumni-backend:latest'
                }
            }
        }
        stage('Frontend Build & Test') {
            steps {
                dir('alumni-connect-frontend') {
                    sh 'npm install'
                    sh 'npx cypress run'           // Run Cypress tests
                    sh 'docker build -t aliasjad12/alumni-frontend:latest .'
                    sh 'docker push aliasjad12/alumni-frontend:latest'
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                sh 'kubectl apply -f k8s/backend-deployment.yaml'
                sh 'kubectl apply -f k8s/frontend-deployment.yaml'
            }
        }
    }
}
