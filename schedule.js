import {timezone, scheduleData} from "./test/data/schedule-ex1.js";
export class Schedule {
    static getAvailableSlots(){
        let availableSlots = [];
        for (const slot of scheduleData) {
            if(!slot.artist) {
                availableSlots.push(slot);
            }
        }
        return availableSlots;
    }
}
