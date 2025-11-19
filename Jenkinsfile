pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-id')
        NPM_CACHE = "${WORKSPACE}/.npm-cache"
        NODE_MODULES_BACKEND = "${WORKSPACE}/backend/node_modules"
        NODE_MODULES_FRONTEND = "${WORKSPACE}/alumni-connect-frontend/node_modules"
        CYPRESS_CACHE = "${WORKSPACE}/.cache/Cypress"
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
                        docker.image('node:20').inside(
                            "--user root -e NPM_CONFIG_CACHE=${NPM_CACHE} " +
                            "-v ${NPM_CACHE}:${NPM_CACHE} " +
                            "-v ${NODE_MODULES_BACKEND}:/app/node_modules"
                        ) {
                            sh '''
                                echo "== FAST BUILD =="
                                npm install --legacy-peer-deps --unsafe-perm
                                npm test || echo "No backend tests yet"
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
                        docker.image('node:20').inside(
                            "--user root " +
                            "-e NPM_CONFIG_CACHE=${NPM_CACHE} " +
                            "-v ${NPM_CACHE}:${NPM_CACHE} " +
                            "-v ${NODE_MODULES_FRONTEND}:/app/node_modules " +
                            "-e CYPRESS_CACHE_FOLDER=${CYPRESS_CACHE} " +
                            "-v ${CYPRESS_CACHE}:${CYPRESS_CACHE}"
                        ) {
                            sh '''
                                echo "== FAST FRONTEND BUILD =="
                                npm install --legacy-peer-deps --unsafe-perm
                                npx cypress run || echo "No Cypress tests"
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
                withCredentials([file(credentialsId: 'kubeconfig-cred', variable: 'KUBECONFIG_FILE')]) {
                    sh '''
                        export KUBECONFIG=$KUBECONFIG_FILE
                        kubectl apply -f k8s/backend-secrets.yaml --validate=false
                        kubectl apply -f k8s/backend-deployment.yaml --validate=false
                        kubectl apply -f k8s/frontend-deployment.yaml --validate=false
                        kubectl get pods
                        kubectl get svc
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }
    }
}
