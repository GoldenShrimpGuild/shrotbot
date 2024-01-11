//FIXME these tests no longer valid since switching to discord.js
import assert from "assert";
import {Schedule} from "../schedule.js";

import chaiHttp from 'chai-http';
import chai from 'chai';
chai.use(chaiHttp);

const { expect } = chai;
import server from '../app.js';

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

describe('Discord Bot Interactions', () => {
    it('should invoke the "synthon available" command', (done) => {
        const interactionData = {
            type: 2, // Type 2 for "APPLICATION_COMMAND",
            id: 'booger',
            data: {
                name: 'synthon',
                "options": [{
                    "type": 1,
                    "name": "available",
                    "description": "Reports the available slots for current SYNTHON!"
                }],
                // Add other necessary command data here
            },
            // Include other necessary interaction properties like "guild_id", "channel_id", etc.
        };

        chai.request(server)
            .post('/interactions')
            .send(interactionData)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                // Add more assertions as needed based on your handler's response
                done();
                //FIXME this is timing out.  I tried removing done param from it method and rewriting this w/ .then,
                //assuming promises were in use, but that just resulted in it succeeding silently, regardless of expects I added.
            });
    });
});
