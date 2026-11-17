import { db } from "./db.js";
import { spaces } from "../data/spaces.js";

const addSpace = db.prepare(`INSERT OR IGNORE INTO spaces
  (id, name, type, building, floor, distance, capacity, facilities, rules)
  VALUES (?,?,?,?,?,?,?,?,?)`);
const addSeat = db.prepare("INSERT OR IGNORE INTO seats (space_id, label) VALUES (?,?)");

db.transaction(() => {
  for (const s of spaces) {
    addSpace.run(s.id, s.name, s.type, s.building, s.floor, s.distance, s.capacity,
      JSON.stringify(s.facilities), JSON.stringify(s.rules));
    const labels = s.type === "meeting"
      ? ["ห้อง 1"]
      : ["A01", "A02", "A03", "A04", "A05"].map((n) => `ที่นั่ง ${n}`);
    labels.forEach((label) => addSeat.run(s.id, label));
  }
})();
console.log("Seeded.");