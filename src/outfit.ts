import {
  canEquip,
  equip,
  equippedAmount,
  equippedItem,
  Familiar,
  Item,
  myFamiliar,
  Slot,
  useFamiliar,
} from "kolmafia";
import { $item, $slot, $slots, have } from "libram";

export default class Outfit {
  equips: Map<Slot, Item>;
  familiar?: Familiar;

  /**
   * Construct an outfit object, for rapid equipping
   * @param equips Map of what to equip and where
   * @param familiar Optional familiar to use with outfit
   */
  constructor(equips: Map<Slot, Item>, familiar?: Familiar) {
    this.equips = equips;
    this.familiar = familiar;
  }

  dress(): void {
    if (this.familiar) useFamiliar(this.familiar);
    const targetEquipment = Array.from(this.equips.values());
    const accessorySlots = $slots`acc1, acc2, acc3`;
    for (const slot of $slots`weapon, off-hand, hat, shirt, pants, familiar, buddy-bjorn, crown-of-thrones, back`) {
      if (
        targetEquipment.includes(equippedItem(slot)) &&
        this.equips.get(slot) !== equippedItem(slot)
      )
        equip(slot, $item`none`);
    }

    //Order is anchored here to prevent DFSS shenanigans
    for (const slot of $slots`weapon, off-hand, hat, back, shirt, pants, familiar, buddy-bjorn, crown-of-thrones`) {
      const equipment = this.equips.get(slot);
      if (equipment) equip(slot, equipment);
    }

    //We don't care what order accessories are equipped in, just that they're equipped
    const accessoryEquips = accessorySlots
      .map((slot) => this.equips.get(slot))
      .filter((item) => item !== undefined) as Item[];
    for (const slot of accessorySlots) {
      const toEquip = accessoryEquips.find(
        (equip) =>
          equippedAmount(equip) < accessoryEquips.filter((accessory) => accessory === equip).length
      );
      if (!toEquip) break;
      const currentEquip = equippedItem(slot);
      //We never want an empty accessory slot
      if (
        currentEquip === $item`none` ||
        equippedAmount(currentEquip) >
          accessoryEquips.filter((accessory) => accessory === currentEquip).length
      ) {
        equip(slot, toEquip);
      }
    }
  }

  /**
   * Identical to withOutfit; executes callback function with equipped outfit, and returns to original outfit
   * @param callback Function to execute
   */
  with<T>(callback: () => T): T {
    return withOutfit(this, callback);
  }

  /**
   * Makes the best outfit it can with what you've got
   * @param equips Map of what to equip and where; will use first item in array that it can, and willl not add things to outfit otherwise
   * @param familiar Optional familiar to use with outfit
   */
  static doYourBest(equips: Map<Slot, Item | Item[]>, familiar?: Familiar): Outfit {
    const returnValue = new Map<Slot, Item>();
    for (const [slot, itemOrItems] of equips.entries()) {
      const item = Array.isArray(itemOrItems)
        ? itemOrItems.find((item) => have(item) && (slot === $slot`familiar` || canEquip(item)))
        : itemOrItems;
      if (item) returnValue.set(slot, item);
    }
    return new Outfit(returnValue, familiar);
  }

  /**
   * Saves current outfit as an Outfit
   * @param withFamiliar Option to store current familiar as part of outfit
   */
  static current(withFamiliar = false): Outfit {
    const familiar = withFamiliar ? myFamiliar() : undefined;
    const slots = $slots`hat, shirt, back, weapon, off-hand, pants, acc1, acc2, acc3`;
    if (withFamiliar) slots.push($slot`familiar`);
    const outfitMap = new Map<Slot, Item>();
    for (const slot of slots) {
      const item = equippedItem(slot);
      if (item !== $item`none`) outfitMap.set(slot, item);
    }
    return new Outfit(outfitMap, familiar);
  }
}

/**
 * Execute callback while wearing given outfit
 * Then return to what you were previously wearing
 * @param outfit Outfit to use
 * @param callback Function to execute
 */
export function withOutfit<T>(outfit: Outfit, callback: () => T): T {
  const withFamiliar = outfit.familiar !== undefined;
  const cachedOutfit = Outfit.current(withFamiliar);
  outfit.dress();
  try {
    return callback();
  } finally {
    cachedOutfit.dress();
  }
}
