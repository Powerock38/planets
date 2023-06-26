export class Inventory {

  items = new Map<string, number>()

  add(item: string, amount: number) {
    if (this.items.has(item)) {
      this.items.set(item, this.items.get(item)! + amount)
    } else {
      this.items.set(item, amount)
    }
  }

}