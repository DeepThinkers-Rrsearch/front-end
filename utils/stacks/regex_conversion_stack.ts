// lib/PushDownAutomataStack.ts

type StackItem = {
  string: string
  conversion: string
}

export default class REGEX_Stack {
  private stack: StackItem[] = []

  push(string: string, conversion: string): void {
    this.stack.push({ string, conversion })
  }

  pop(): StackItem | null {
    return this.stack.pop() || null
  }

  peek(): StackItem | null {
    return this.stack.length ? this.stack[this.stack.length - 1] : null
  }

  size(): number {
    return this.stack.length
  }

  isEmpty(): boolean {
    return this.stack.length === 0
  }

  getStack(): StackItem[] {
    return [...this.stack]  // Return a copy to avoid direct mutation
  }
}
