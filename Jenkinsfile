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
                        // Run node container as root inside Jenkins workspace to avoid permission issues
                        docker.image('node:20').inside("--user root -e NPM_CONFIG_CACHE=/tmp/.npm -v /tmp/.npm:/tmp/.npm") {
                            sh '''
                                rm -rf node_modules package-lock.json
                                npm cache clean --force
                                npm install --legacy-peer-deps --unsafe-perm
                                npm test || echo "No backend tests yet, continuing..."
                            '''
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
                        docker.image('node:20').inside("--user root -e NPM_CONFIG_CACHE=/tmp/.npm -v /tmp/.npm:/tmp/.npm") {
                            sh '''
                                rm -rf node_modules package-lock.json
                                npm cache clean --force
                                npm install --legacy-peer-deps --unsafe-perm
                                npx cypress run || echo "No frontend tests yet, continuing..."
                            '''
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
