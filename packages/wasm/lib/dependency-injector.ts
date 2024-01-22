export class DependencyInjector {
  private dependencies: { [key: string]: any } = {}

  async loadDependency(modulePath: string, exportName: string) {
    try {
      const module = await import(/* @vite-ignore */ modulePath)
      this.dependencies[exportName] = module[exportName] ?? module
    } catch (error) {
      console.error(`Failed to load module: ${modulePath}`, error)
    }
  }

  getDependency(name: string) {
    if (!this.dependencies[name]) {
      throw new Error(`Dependency ${name} is not loaded`)
    }
    return this.dependencies[name]
  }
}
