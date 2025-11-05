
export function createBackpack(option) {
    const backpack = {
        items: option.items ?? [],
        maxPerType: option.maxPerType ?? 9,
        add(item) {
            const count = this.items.filter(i => i.type === item.type).length;
            if (count >= this.maxPerType) {
                console.log("Нельзя добавить: достигнут лимит для этого типа");
                return false;
            }
            this.items.push(item);
            return true;
        },
        remove(itemId) {
            const idx = this.items.findIndex(i => i.id === itemId);
            if (idx === -1) return null;
            return this.items.splice(idx, 1)[0];
        },
        list() { return this.items; }
    };
    return backpack;

}
const option = {
    items: [],
    maxPerType: 9
}


createBackpack(option)