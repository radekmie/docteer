import {Meteor} from 'meteor/meteor';
import {Mongo}  from 'meteor/mongo';

export class PlainCollection extends Mongo.Collection {
    aggregate () {
        // eslint-disable-next-line
        console.assert(Meteor.isServer, 'PlainCollection.aggregate is available only on server.');

        const rawHandle = this.rawCollection();
        const aggregate = Meteor.wrapAsync(rawHandle.aggregate.bind(rawHandle));

        return aggregate(...arguments);
    }

    find (selector = {}, options = {}) {
        return super.find(selector, {...options, transform: null});
    }

    findOne (selector = {}, options = {}) {
        return super.findOne(selector, {...options, transform: null});
    }
}
