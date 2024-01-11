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
    static getTimezone() {
        return timezone;
    }
    //rudimentary method filtering schedule by artist name, which will be a display name that may vary from the twitch
    //name so start with artist name and search by twitch name if that is empty as a simple heuristic to make this
    //more useful
    static getArtistSlots(artistName) {
        return scheduleData.filter((slot)=>{
            return (slot.artist.toLowerCase() === artistName.toLowerCase()) ||
            (slot.twitchUrl.toLowerCase().endsWith(artistName.toLowerCase()));
        });
    }
}
