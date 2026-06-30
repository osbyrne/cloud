# ContactSphere — Application de Gestion de Contacts avec React, Tailwind et Kubernetes

ContactSphere est une application moderne et élégante pour gérer ses contacts, écrite avec React pour le frontend, Express pour le backend, packagée avec Docker et déployée sur Kubernetes.

## Prérequis

Pour exécuter ce projet localement, vous aurez besoin de :

- Homebrew
- Docker
- Minikube
- kubectl

### Installation des outils

```bash
brew install minikube kubectl
```

Assurez-vous également que Docker est démarré et fonctionnel.

## Exécution locale avec Kubernetes

### 1. Démarrer Minikube
```bash
minikube start
```

### 2. Configurer le terminal pour le démon Docker de Minikube
Pour construire l'image Docker directement dans le cluster sans passer par un registre externe, configurez votre terminal actuel :
```bash
eval $(minikube docker-env)
```

### 3. Construire l'image Docker
```bash
docker build -t contact-manager:latest .
```

### 4. Déployer l'application sur Kubernetes
Déployez le Deployment et le Service :
```bash
kubectl apply -f k8s/deployment.yaml -f k8s/service.yaml
```

### 5. Accéder à l'application
Utilisez la redirection de port (Port-Forward) pour accéder à l'application depuis votre machine hôte :
```bash
kubectl port-forward svc/contact-manager-svc 8080:80
```

L'application est désormais accessible à l'adresse suivante : [http://localhost:8080](http://localhost:8080).
