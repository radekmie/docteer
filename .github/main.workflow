workflow "Deploy" {
  on = "push"
  resolves = ["Update"]
}

action "Build" {
  uses = "actions/docker/cli@c08a5fc9e0286844156fefff2c141072048141f6"
  args = "build --tag docteer ."
}

action "Tag" {
  uses = "actions/docker/tag@c08a5fc9e0286844156fefff2c141072048141f6"
  needs = ["Build"]
  args = "docteer registry.docteer.com/docteer"
}

action "Login" {
  uses = "actions/docker/login@c08a5fc9e0286844156fefff2c141072048141f6"
  needs = ["Tag"]
  secrets = ["DOCKER_USERNAME", "DOCKER_REGISTRY_URL", "DOCKER_PASSWORD"]
}

action "Push" {
  uses = "actions/docker/cli@c08a5fc9e0286844156fefff2c141072048141f6"
  needs = ["Login"]
  args = "push registry.docteer.com/docteer"
}

action "Update" {
  uses = "swinton/httpie.action@02571a073b9aaf33930a18e697278d589a8051c1"
  args = ["POST", "https://portainer.docteer.com/api/webhooks/83d206af-2d99-4984-8228-6a4f21760322"]
  needs = ["Push"]
}
