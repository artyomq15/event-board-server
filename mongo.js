function randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
}

function randomColor() {
    return "#d" + Math.random().toString(16).slice(3, 8);
}

use timeTable;

db.events.drop();
db.users.drop();
db.boards.drop();

let insertedIds = db.users.insertMany([
    {
        firstName: 'qwe',
        secondName: 'qwe',
        username: 'qwe@qwe',
        hash: 'a605d53534bf80c2a5f6925c9543034ae4d576afe727f844281721133cf6bc032551dd7404b45540d9f4ca69be77d7ca0d20bfcec4076352f78d4af8837be14a',
        salt: '1921fc350afdcce8b428cdad2ad84093'
    },
    {
        firstName: 'asd',
        secondName: 'asd',
        username: 'asd@asd',
        hash: 'f9e156be7d1b5a67829b3578e0485bcce1140115318532da0004aeaae98c24dfc6745f0ec19fb7b097987a89bc2c25ba2db1dc31291e55b7bf9e5b15d603b6b9',
        salt: '26bd1c39f9394e50cd6d6d51ace1c1f2'
    },
    {
        firstName: 'zxc',
        secondName: 'zxc',
        username: 'zxc@zxc',
        hash: '53f6d1dd048ca668d81fe73ab29c2e44870de12bd2a40bb9ac8f69ccac40f66582a9bf46b2565834c0ebec1e8100259833cd1e5ec699ffb62970f8d1b954ffd2',
        salt: '308cf5f62ddee84874b257a790b8d648'
    }
]).insertedIds;


for (let i = 0; i < 5; i++) {
    let date = new Date();

    let hour = randomInteger(0, 15);
    let dayDelta = randomInteger(-7, 7);

    let dateFrom = new Date(date.getFullYear(), date.getMonth(), date.getDate() + dayDelta, hour);
    let dateTo = new Date(date.getFullYear(), date.getMonth(), date.getDate() + dayDelta, hour + randomInteger(1, 6));

    db.events.insertOne(
        {
            name: 'Event',
            description: 'Description',
            timeFrom: dateFrom,
            timeTo: dateTo,
            participants: [ insertedIds[0], insertedIds[randomInteger(1, 2)] ],
            creator: insertedIds[0],
            invited: [],
            color: randomColor()
        }
    );
}

let createdBoard = db.boards.insertOne({
    name: 'Conference',
    isPrivate: false,
    creator: insertedIds[0],
    participants: [insertedIds[0], insertedIds[1]],
    invited: [insertedIds[2]]
}).insertedId

for (let i = 0; i < 10; i++) {
    let date = new Date();

    let hour = randomInteger(0, 15);
    let dayDelta = randomInteger(-7, 7);

    let dateFrom = new Date(date.getFullYear(), date.getMonth(), date.getDate() + dayDelta, hour);
    let dateTo = new Date(date.getFullYear(), date.getMonth(), date.getDate() + dayDelta, hour + randomInteger(1, 6));

    db.events.insertOne(
        {
            name: 'Conference event' + i,
            description: 'Description',
            timeFrom: dateFrom,
            timeTo: dateTo,
            participants: [ insertedIds[0] ],
            creator: insertedIds[0],
            invited: [],
            color: randomColor(),
            board: createdBoard,
        }
    );
}