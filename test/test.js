import assert from "assert";
import {Schedule} from "../schedule.js";

describe('Schedule', function(){
   describe('#getAvailableSlots()', function(){
       it('should not die', function(){
           assert.doesNotThrow(function(){
               Schedule.getAvailableSlots();
           }, Error);
       });
       it('Should have 32 available slots', function(){
           assert.equal(Schedule.getAvailableSlots().length, 32);
       });
   });
});
