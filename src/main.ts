import {
  abort,
  canInteract,
  cliExecute,
  itemAmount,
  myLevel,
  print,
  retrieveItem,
  use,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $skill,
  $slot,
  adventureMacroAuto,
  Clan,
  get,
  have,
  StrictMacro,
  uneffect,
} from "libram";
import Outfit from "./outfit";
Clan.withStash("Alliance From Heck", $items`repaid diaper`, () =>
  Clan.withStash("Hobopolis Vacation Home", $items`meteorite necklace`, () => {
    cliExecute("phccs_gash softcore");
    if (myLevel() !== 1) abort("Failed to ascend!");
    cliExecute("phccs");

    if (!get("csServicesPerformed").includes("Make Sausage")) abort("Failed to complete CS run!");
  })
);

if (!canInteract()) {
  visitUrl("council.php");
  visitUrl("choice.php?whichchoice=1089&option=30");
}
if (!get("kingLiberated")) abort("Failed to donate body!");

cliExecute("pull all");
if (have($item`can of Rain-Doh`)) use(1, $item`can of Rain-Doh`);

Clan.withStash("Alliance From Heck", $items`Pantsgiving`, (borrowedItems: Item[]) => {
  if (!borrowedItems.includes($item`Pantsgiving`)) abort("No pants!");
  retrieveItem(6, $item`heat-resistant sheet metal`);
  new Outfit(
    new Map<Slot, Item>([
      [$slot`hat`, $item`Iunion Crown`],
      [$slot`back`, $item`Buddy Bjorn`],
      [$slot`shirt`, $item`BGE 'cuddly critter' shirt`],
      [$slot`weapon`, $item`garbage sticker`],
      [$slot`off-hand`, $item`cursed magnifying glass`],
      [$slot`pants`, $item`Pantsgiving`],
      [$slot`acc1`, $item`mafia thumb ring`],
      [$slot`acc2`, $item`lucky gold ring`],
      [$slot`acc3`, $item`Mr. Cheeng's spectacles`],
      [$slot`familiar`, $item`orange boxing gloves`],
    ]),
    $familiar`Puck Man`
  ).with(() => {
    const volcoinos = itemAmount($item`Volcoino`);
    const volcoinoCheck = () =>
      itemAmount($item`Volcoino`) > volcoinos + (get("_luckyGoldRingVolcoino") ? 1 : 0);
    while (!volcoinoCheck() && !have($effect`Beaten Up`)) {
      adventureMacroAuto(
        $location`The Bubblin' Caldera`,
        StrictMacro.skill($skill`Weapon of the Pastalord`).item($item`exploding cigar`)
      );
    }
    cliExecute("hottub");
  });
  uneffect($effect`Cowrruption`);
});
cliExecute("breakfast");
print("You're ready for garbo, cowboy!");
