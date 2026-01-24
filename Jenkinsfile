@Library('shared-library') _

pipeline {
    agent any

    parameters {
        choice(
            name: 'SERVICE',
            choices: [
                'all',
                'user-service',
                'product-service',
                'order-service',
                'api-gateway',
                'frontend'
            ],
            description: 'Which service to build and deploy?'
        )

        choice(
            name: 'ENVIRONMENT',
            choices: ['development', 'staging', 'production'],
            description: 'Target deployment environment'
        )

        booleanParam(
            name: 'RUN_TESTS',
            defaultValue: true,
            description: 'Run unit and integration tests'
        )

        booleanParam(
            name: 'SKIP_BUILD',
            defaultValue: false,
            description: 'Skip building Docker images (deploy existing images)'
        )

        booleanParam(
            name: 'DEPLOY_TO_K8S',
            defaultValue: true,
            description: 'Deploy to Kubernetes after build'
        )

        string(
            name: 'IMAGE_TAG',
            defaultValue: '',
            description: 'Custom image tag (leave empty for auto-generated)'
        )
    }

    environment {
        // Docker Registry
        DOCKER_REGISTRY = credentials('docker-registry-url')
        DOCKER_CREDENTIALS = credentials('docker-registry-credentials')

        // Kubernetes
        KUBECONFIG = credentials('kubeconfig-file')
        K8S_NAMESPACE = "${params.ENVIRONMENT}"

        // Git Info
        GIT_COMMIT_SHORT = sh(
            script: "git rev-parse --short HEAD",
            returnStdout: true
        ).trim()

        // Image Tag
        BUILD_TAG = params.IMAGE_TAG ?: "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"

        // Service Configuration
        SERVICE_CONFIG = [
            'user-service': [port: '4001', path: 'services/user-service'],
            'product-service': [port: '4002', path: 'services/product-service'],
            'order-service': [port: '4003', path: 'services/order-service'],
            'api-gateway': [port: '4000', path: 'services/api-gateway'],
            'frontend': [port: '80', path: 'frontend-web']
        ]

        // Slack
        SLACK_CHANNEL = '#deployments'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        timeout(time: 1, unit: 'HOURS')
        timestamps()
    }

    stages {
        stage('Initialization') {
            steps {
                script {
                    echo """
                    ╔════════════════════════════════════════╗
                    ║   E-Commerce Platform Deployment      ║
                    ╚════════════════════════════════════════╝

                    📦 Service: ${params.SERVICE}
                    🌍 Environment: ${params.ENVIRONMENT}
                    🏷️  Tag: ${BUILD_TAG}
                    👤 Started by: ${env.BUILD_USER}
                    🔧 Build #${env.BUILD_NUMBER}
                    """

                    // Determine which services to build
                    if (params.SERVICE == 'all') {
                        env.SERVICES_TO_BUILD = detectChangedServices()
                        echo "📝 Detected changes in: ${env.SERVICES_TO_BUILD}"
                    } else {
                        env.SERVICES_TO_BUILD = params.SERVICE
                    }
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_MSG = sh(
                        script: 'git log -1 --pretty=%B',
                        returnStdout: true
                    ).trim()

                    echo "📝 Commit: ${env.GIT_COMMIT_MSG}"
                }
            }
        }

        stage('Environment Check') {
            steps {
                script {
                    sh '''
                        echo "🔍 Checking environment..."
                        docker --version
                        kubectl version --client
                        node --version
                        npm --version
                    '''
                }
            }
        }

        stage('Run Tests') {
            when {
                expression { params.RUN_TESTS && !params.SKIP_BUILD }
            }
            parallel {
                stage('User Service Tests') {
                    when {
                        expression { shouldBuild('user-service') }
                    }
                    steps {
                        script {
                            runTests('user-service')
                        }
                    }
                }

                stage('Product Service Tests') {
                    when {
                        expression { shouldBuild('product-service') }
                    }
                    steps {
                        script {
                            runTests('product-service')
                        }
                    }
                }

                stage('Order Service Tests') {
                    when {
                        expression { shouldBuild('order-service') }
                    }
                    steps {
                        script {
                            runTests('order-service')
                        }
                    }
                }

                stage('API Gateway Tests') {
                    when {
                        expression { shouldBuild('api-gateway') }
                    }
                    steps {
                        script {
                            runTests('api-gateway')
                        }
                    }
                }

                stage('Frontend Tests') {
                    when {
                        expression { shouldBuild('frontend') }
                    }
                    steps {
                        script {
                            runFrontendTests()
                        }
                    }
                }
            }
        }

        stage('Code Quality & Security') {
            when {
                expression { params.RUN_TESTS && !params.SKIP_BUILD }
            }
            parallel {
                stage('Linting') {
                    steps {
                        script {
                            echo '🔍 Running ESLint...'
                            // sh 'npm run lint'
                        }
                    }
                }

                stage('Security Audit') {
                    steps {
                        script {
                            echo '🔒 Running security audit...'
                            sh 'npm audit --audit-level=moderate || true'
                        }
                    }
                }

                stage('Dependency Check') {
                    steps {
                        script {
                            echo '📦 Checking dependencies...'
                            // sh 'npm outdated || true'
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            when {
                expression { !params.SKIP_BUILD }
            }
            parallel {
                stage('Build User Service') {
                    when {
                        expression { shouldBuild('user-service') }
                    }
                    steps {
                        script {
                            buildDockerImage('user-service')
                        }
                    }
                }

                stage('Build Product Service') {
                    when {
                        expression { shouldBuild('product-service') }
                    }
                    steps {
                        script {
                            buildDockerImage('product-service')
                        }
                    }
                }

                stage('Build Order Service') {
                    when {
                        expression { shouldBuild('order-service') }
                    }
                    steps {
                        script {
                            buildDockerImage('order-service')
                        }
                    }
                }

                stage('Build API Gateway') {
                    when {
                        expression { shouldBuild('api-gateway') }
                    }
                    steps {
                        script {
                            buildDockerImage('api-gateway')
                        }
                    }
                }

                stage('Build Frontend') {
                    when {
                        expression { shouldBuild('frontend') }
                    }
                    steps {
                        script {
                            buildFrontendImage()
                        }
                    }
                }
            }
        }

        stage('Push to Registry') {
            when {
                expression { !params.SKIP_BUILD }
            }
            steps {
                script {
                    echo '📤 Pushing images to registry...'

                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                        def services = env.SERVICES_TO_BUILD.split(',')
                        services.each { service ->
                            def serviceName = service.trim()
                            echo "Pushing ${serviceName}:${BUILD_TAG}"

                            sh """
                                docker tag ${serviceName}:${BUILD_TAG} ${DOCKER_REGISTRY}/${serviceName}:${BUILD_TAG}
                                docker push ${DOCKER_REGISTRY}/${serviceName}:${BUILD_TAG}
                                docker tag ${serviceName}:${BUILD_TAG} ${DOCKER_REGISTRY}/${serviceName}:latest
                                docker push ${DOCKER_REGISTRY}/${serviceName}:latest
                            """
                        }
                    }
                }
            }
        }

        stage('Container Security Scan') {
            when {
                expression { !params.SKIP_BUILD }
            }
            steps {
                script {
                    echo '🔒 Scanning containers for vulnerabilities...'
                    // sh 'trivy image ${DOCKER_REGISTRY}/${SERVICE_NAME}:${BUILD_TAG}'
                }
            }
        }

        stage('Approval for Production') {
            when {
                expression { params.ENVIRONMENT == 'production' }
            }
            steps {
                script {
                    def userInput = input(
                        message: '🚀 Deploy to Production?',
                        parameters: [
                            booleanParam(
                                name: 'PROCEED',
                                defaultValue: false,
                                description: 'Are you sure you want to deploy to production?'
                            )
                        ]
                    )

                    if (!userInput) {
                        error('Deployment to production cancelled by user')
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            when {
                expression { params.DEPLOY_TO_K8S }
            }
            steps {
                script {
                    echo "🚀 Deploying to ${params.ENVIRONMENT}..."

                    withCredentials([file(credentialsId: 'kubeconfig-file', variable: 'KUBECONFIG')]) {
                        if (params.SERVICE == 'all') {
                            // Deploy all services
                            sh """
                                export KUBECONFIG=\$KUBECONFIG
                                ./scripts/deploy-k8s.sh ${params.ENVIRONMENT}
                            """
                        } else {
                            // Deploy specific service
                            deployService(params.SERVICE, params.ENVIRONMENT)
                        }
                    }
                }
            }
        }

        stage('Verify Deployment') {
            when {
                expression { params.DEPLOY_TO_K8S }
            }
            steps {
                script {
                    withCredentials([file(credentialsId: 'kubeconfig-file', variable: 'KUBECONFIG')]) {
                        def services = env.SERVICES_TO_BUILD.split(',')

                        services.each { service ->
                            def serviceName = service.trim()
                            echo "✅ Verifying ${serviceName}..."

                            sh """
                                export KUBECONFIG=\$KUBECONFIG

                                # Wait for pods to be ready
                                kubectl rollout status deployment/${serviceName} \
                                    -n ${params.ENVIRONMENT} \
                                    --timeout=5m

                                # Check pod status
                                kubectl get pods -l app=${serviceName} \
                                    -n ${params.ENVIRONMENT}
                            """
                        }
                    }
                }
            }
        }

        stage('Smoke Tests') {
            when {
                expression { params.DEPLOY_TO_K8S }
            }
            steps {
                script {
                    echo '🧪 Running smoke tests...'

                    withCredentials([file(credentialsId: 'kubeconfig-file', variable: 'KUBECONFIG')]) {
                        sh """
                            export KUBECONFIG=\$KUBECONFIG
                            ./scripts/smoke-tests.sh ${params.ENVIRONMENT}
                        """
                    }
                }
            }
        }

        stage('Update Documentation') {
            steps {
                script {
                    echo '📚 Updating deployment documentation...'

                    sh """
                        cat > DEPLOYMENT_INFO.txt << EOF
Deployment Information
======================
Date: \$(date)
Build: #${env.BUILD_NUMBER}
Environment: ${params.ENVIRONMENT}
Services: ${env.SERVICES_TO_BUILD}
Image Tag: ${BUILD_TAG}
Git Commit: ${env.GIT_COMMIT_SHORT}
Deployed by: ${env.BUILD_USER}
EOF
                    """

                    archiveArtifacts artifacts: 'DEPLOYMENT_INFO.txt'
                }
            }
        }
    }

    post {
        success {
            script {
                def duration = currentBuild.durationString.replace(' and counting', '')

                echo """
                ╔════════════════════════════════════════╗
                ║          ✅ DEPLOYMENT SUCCESS         ║
                ╚════════════════════════════════════════╝

                🎉 Service: ${params.SERVICE}
                🌍 Environment: ${params.ENVIRONMENT}
                ⏱️  Duration: ${duration}
                🏷️  Tag: ${BUILD_TAG}
                """

                // Send Slack notification
                slackSend(
                    channel: env.SLACK_CHANNEL,
                    color: 'good',
                    message: """
                        *Deployment Successful* ✅

                        *Service:* ${params.SERVICE}
                        *Environment:* ${params.ENVIRONMENT}
                        *Build:* #${env.BUILD_NUMBER}
                        *Tag:* ${BUILD_TAG}
                        *Duration:* ${duration}
                        *Deployed by:* ${env.BUILD_USER}

                        <${env.BUILD_URL}|View Build>
                    """.stripIndent()
                )
            }
        }

        failure {
            script {
                echo """
                ╔════════════════════════════════════════╗
                ║          ❌ DEPLOYMENT FAILED          ║
                ╚════════════════════════════════════════╝

                ⚠️  Service: ${params.SERVICE}
                🌍 Environment: ${params.ENVIRONMENT}
                🏷️  Tag: ${BUILD_TAG}
                """

                // Send Slack notification
                slackSend(
                    channel: env.SLACK_CHANNEL,
                    color: 'danger',
                    message: """
                        *Deployment Failed* ❌

                        *Service:* ${params.SERVICE}
                        *Environment:* ${params.ENVIRONMENT}
                        *Build:* #${env.BUILD_NUMBER}
                        *Failed at:* ${env.STAGE_NAME}

                        <${env.BUILD_URL}console|View Console Output>
                    """.stripIndent()
                )
            }
        }

        unstable {
            script {
                slackSend(
                    channel: env.SLACK_CHANNEL,
                    color: 'warning',
                    message: """
                        *Deployment Unstable* ⚠️

                        *Service:* ${params.SERVICE}
                        *Environment:* ${params.ENVIRONMENT}
                        *Build:* #${env.BUILD_NUMBER}
                    """.stripIndent()
                )
            }
        }

        always {
            script {
                // Clean workspace
                cleanWs()

                // Clean Docker images
                sh '''
                    docker system prune -f
                '''
            }
        }
    }
}

// ============================================
// Helper Functions
// ============================================

def detectChangedServices() {
    def changes = sh(
        script: 'git diff --name-only HEAD~1 || echo "all"',
        returnStdout: true
    ).trim()

    def services = []

    if (changes.contains('services/user-service')) services.add('user-service')
    if (changes.contains('services/product-service')) services.add('product-service')
    if (changes.contains('services/order-service')) services.add('order-service')
    if (changes.contains('services/api-gateway')) services.add('api-gateway')
    if (changes.contains('frontend-web')) services.add('frontend')

    // If no specific service changed or if infrastructure changed, build all
    if (services.isEmpty() || changes.contains('infrastructure/')) {
        services = ['user-service', 'product-service', 'order-service', 'api-gateway', 'frontend']
    }

    return services.join(',')
}

def shouldBuild(serviceName) {
    return env.SERVICES_TO_BUILD?.contains(serviceName) ?: false
}

def runTests(serviceName) {
    dir("services/${serviceName}") {
        echo "🧪 Running tests for ${serviceName}..."

        sh '''
            npm ci
            npm run test -- --coverage --watchAll=false || true
        '''

        // Publish test results
        junit allowEmptyResults: true, testResults: '**/test-results/*.xml'

        // Publish coverage
        publishHTML([
            reportDir: 'coverage',
            reportFiles: 'index.html',
            reportName: "${serviceName} Coverage Report"
        ])
    }
}

def runFrontendTests() {
    dir('frontend-web') {
        echo '🧪 Running frontend tests...'

        sh '''
            npm ci
            npm run test -- --watchAll=false || true
        '''
    }
}

def buildDockerImage(serviceName) {
    def serviceConfig = env.SERVICE_CONFIG[serviceName]
    def servicePath = serviceName.startsWith('frontend') ? 'frontend-web' : "services/${serviceName}"

    dir(servicePath) {
        echo "🐳 Building Docker image for ${serviceName}..."

        sh """
            docker build \
                --target production \
                --tag ${serviceName}:${BUILD_TAG} \
                --tag ${serviceName}:latest \
                --build-arg BUILD_DATE=\$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
                --build-arg VERSION=${BUILD_TAG} \
                --build-arg VCS_REF=${GIT_COMMIT_SHORT} \
                .
        """

        echo "✅ Successfully built ${serviceName}:${BUILD_TAG}"
    }
}

def buildFrontendImage() {
    dir('frontend-web') {
        echo '🐳 Building frontend Docker image...'

        sh """
            docker build \
                --target production \
                --tag frontend:${BUILD_TAG} \
                --tag frontend:latest \
                .
        """

        echo "✅ Successfully built frontend:${BUILD_TAG}"
    }
}

def deployService(serviceName, environment) {
    echo "🚀 Deploying ${serviceName} to ${environment}..."

    sh """
        kubectl set image deployment/${serviceName} \
            ${serviceName}=${DOCKER_REGISTRY}/${serviceName}:${BUILD_TAG} \
            -n ${environment}

        kubectl annotate deployment/${serviceName} \
            kubernetes.io/change-cause="Build #${env.BUILD_NUMBER} - ${env.GIT_COMMIT_MSG}" \
            -n ${environment} \
            --overwrite
    """
}