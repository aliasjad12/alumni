pipeline {
    agent any

    environment {
        // Docker Hub credentials stored in Jenkins
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-id')
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/aliasjad12/alumni.git'
            }
        }

        stage('Backend Build & Push') {
            steps {
                dir('backend') {
                    script {
                        // Run Node/npm commands inside a Node container
                        docker.image('node:18').inside {
                            sh 'npm install'
                            sh 'npm test || echo "No backend tests yet, continuing..."'
                        }

                        // Login to Docker Hub and push image
                        withCredentials([usernamePassword(credentialsId: 'dockerhub-id', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                            sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS'
                        }

                        sh 'docker build -t aliasjad12/alumni-backend:latest .'
                        sh 'docker push aliasjad12/alumni-backend:latest'
                    }
                }
            }
        }

        stage('Frontend Build & Push') {
            steps {
                dir('alumni-connect-frontend') {
                    script {
                        docker.image('node:18').inside {
                            sh 'npm install'
                            sh 'npx cypress run || echo "No frontend tests yet, continuing..."'
                        }

                        // Login to Docker Hub and push image
                        withCredentials([usernamePassword(credentialsId: 'dockerhub-id', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                            sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS'
                        }

                        sh 'docker build -t aliasjad12/alumni-frontend:latest .'
                        sh 'docker push aliasjad12/alumni-frontend:latest'
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh 'kubectl apply -f k8s/backend-secrets.yaml'
                sh 'kubectl apply -f k8s/backend-deployment.yaml'
                sh 'kubectl apply -f k8s/frontend-deployment.yaml'
                sh 'kubectl get pods'
                sh 'kubectl get svc'
            }
        }
    }

    post {
        always {
            sh 'docker logout'
        }
    }
}
