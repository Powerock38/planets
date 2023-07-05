export interface PhysicalInventory {
  inventory: Inventory
  x: number
  y: number
}

export class Inventory {
  static INVENTORIES: PhysicalInventory[] = []

  static nearestInventory(x: number, y: number, range: number) {
    console.log(Inventory.INVENTORIES)
    let nearest: PhysicalInventory | undefined
    for (const physicalInventory of Inventory.INVENTORIES) {
      const distance = Math.sqrt(
        (physicalInventory.x - x) ** 2 + (physicalInventory.y - y) ** 2
      )
      if (distance < range) {
        nearest = physicalInventory
      }
    }
    return nearest
  }

  items = new Map<string, number>()

  constructor(public size = 1, x?: number, y?: number) {
    if (x !== undefined && y !== undefined) {
      Inventory.INVENTORIES.push({ inventory: this, x, y })
    }
  }

  add(item: string, amount: number) {
    if (this.items.size <= this.size) {
      if (this.items.has(item)) {
        this.items.set(item, this.items.get(item)! + amount)
      } else {
        this.items.set(item, amount)
      }
    }
  }

  giveTo(inventory: Inventory, item: string, amount: number) {
    if (this.items.has(item)) {
      const currentAmount = this.items.get(item)!
      if (currentAmount >= amount) {
        this.items.set(item, currentAmount - amount)
        inventory.add(item, amount)
      }
    }
  }

  giveNItemsTo(inventory: Inventory, amount: number) {
    this.giveTo(inventory, this.items.keys().next().value, amount)
  }
}
