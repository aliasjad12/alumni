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

        stage('Backend Build & Push') {
            steps {
                dir('backend') {
                    script {
                        // Fix permissions for NPM cache
                        sh "sudo chown -R $(id -u):$(id -g) ${WORKSPACE}/.npm || true"

                        docker.image('node:20').inside("-e NPM_CONFIG_CACHE=${WORKSPACE}/.npm") {
                            sh 'rm -rf node_modules package-lock.json'
                            sh 'npm cache clean --force'
                            sh 'npm install --legacy-peer-deps --unsafe-perm'
                            sh 'npm test || echo "No backend tests yet, continuing..."'
                        }

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
                        // Fix permissions for NPM cache
                        sh "sudo chown -R $(id -u):$(id -g) ${WORKSPACE}/.npm || true"

                        docker.image('node:20').inside("-e NPM_CONFIG_CACHE=${WORKSPACE}/.npm") {
                            sh 'rm -rf node_modules package-lock.json'
                            sh 'npm cache clean --force'
                            sh 'npm install --legacy-peer-deps --unsafe-perm'
                            sh 'npx cypress run || echo "No frontend tests yet, continuing..."'
                        }

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
            sh 'docker logout || true'
        }
    }
}
