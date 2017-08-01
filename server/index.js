import faker    from 'faker/locale/en';
import {minify} from 'html-minifier';

import {Boilerplate} from 'meteor/boilerplate-generator';
import {Meteor}      from 'meteor/meteor';

if (Meteor.isProduction) {
    const options = {
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true
    };

    const rawToHTML = Boilerplate.prototype.toHTML;
    Boilerplate.prototype.toHTML = function toHTML () {
        return minify(rawToHTML.call(this, arguments), options)
            .replace('<html>', '<html lang="en">')
            .replace(/rel="stylesheet"/g, 'as="style" onload="this.rel=\'stylesheet\'" rel="preload"')
        ;
    };
}

Meteor.methods({
    randomData () {
        faker.random.array = (min, max, fn) => Array.from({length: faker.random.number({max, min})}, fn);

        const groups = faker.random.array(3, 5, () =>
            ({
                _id:  faker.random.uuid().substr(0, 8),
                name: faker.commerce.department(),
                tags: faker.random.array(3, 5, () =>
                    ({
                        _id:  faker.random.uuid().substr(0, 8),
                        name: faker.commerce.product()
                    })
                )
            })
        );

        const tags = groups.reduce((tags, group) => tags.concat(group.tags), []);

        const testcases = faker.random.array(10, 50, () =>
            ({
                _id:    faker.random.uuid().substr(0, 8),
                name:   faker.lorem.sentence(),
                expect: faker.lorem.sentences(),
                target: faker.lorem.sentences(),
                steps:  faker.random.array(2, 10, faker.lorem.sentence),
                tags:   groups.map(group =>
                    ({
                        group,
                        ...faker.random.arrayElement(group.tags)
                    })
                )
            })
        );

        return {
            groups,
            tags,
            testcases
        };
    }
});
